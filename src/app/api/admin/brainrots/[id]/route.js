import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin";
import { isSessionAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

function getObjectStorageConfig() {
  const bucket = process.env.R2_BUCKET || process.env.AWS_S3_BUCKET;
  const region = process.env.R2_REGION || process.env.AWS_REGION || "auto";
  const endpoint = process.env.R2_ENDPOINT;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL || process.env.AWS_S3_PUBLIC_BASE_URL;

  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  return { bucket, region, endpoint, publicBaseUrl, accessKeyId, secretAccessKey };
}

function getS3Client({ region, endpoint, accessKeyId, secretAccessKey }) {
  if (!region) throw new Error("Missing region for object storage (set R2_REGION or AWS_REGION)");

  const hasExplicitCreds = Boolean(accessKeyId && secretAccessKey);
  return new S3Client({
    region,
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    ...(hasExplicitCreds ? { credentials: { accessKeyId, secretAccessKey } } : {}),
  });
}

function getPublicObjectUrl({ publicBaseUrl, bucket, region, key }) {
  if (publicBaseUrl) return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function normalizeUrl(value) {
  if (!value) return value;

  const trimmed = String(value).trim();
  if (!trimmed) return trimmed;

  const deDuped = trimmed
    .replace(/^https:\/\/https:\/\//i, "https://")
    .replace(/^http:\/\/http:\/\//i, "http://");

  if (/^https?:\/\//i.test(deDuped)) return deDuped;
  if (deDuped.startsWith("//")) return `https:${deDuped}`;

  return `https://${deDuped}`;
}

function parseJsonFormField(value, fallback) {
  if (value == null) return fallback;
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

async function uploadImageToStorage({ file, objectKey }) {
  if (!file || !(file instanceof File)) return null;
  if (!file.type?.startsWith("image/")) throw new Error("Invalid image type");

  const fileExtension = (file.name?.split(".").pop() || "bin").toLowerCase();
  const allowedExtensions = new Set(["png", "jpg", "jpeg", "webp", "gif"]);
  if (!allowedExtensions.has(fileExtension)) throw new Error("Unsupported image format");

  const { bucket, region, endpoint, publicBaseUrl, accessKeyId, secretAccessKey } =
    getObjectStorageConfig();
  if (!bucket) throw new Error("Missing R2_BUCKET/AWS_S3_BUCKET");
  if (endpoint && (!accessKeyId || !secretAccessKey)) {
    throw new Error("Missing R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY");
  }
  if (endpoint && !publicBaseUrl) {
    throw new Error("Missing R2_PUBLIC_BASE_URL (required for serving public images from R2)");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const s3 = getS3Client({ region, endpoint, accessKeyId, secretAccessKey });
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return normalizeUrl(getPublicObjectUrl({ publicBaseUrl, bucket, region, key: objectKey }));
}

// GET - Fetch a single brainrot by slug
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Safely handle params
    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json({ error: "Missing brainrot slug" }, { status: 400 });
    }

    const slug = String(resolvedParams.id);
    const collectionRef = adminDb.collection("brainrots");

    let brainrotDoc = await collectionRef.doc(slug).get();
    if (!brainrotDoc.exists) {
      const snapshot = await collectionRef.where("slug", "==", slug).limit(1).get();
      brainrotDoc = snapshot.empty ? brainrotDoc : snapshot.docs[0];
    }
    
    if (!brainrotDoc.exists) {
      return NextResponse.json({ error: "Brainrot not found" }, { status: 404 });
    }
    
    const brainrot = {
      id: brainrotDoc.data().slug || brainrotDoc.id,
      ...brainrotDoc.data(),
      // Convert timestamps to milliseconds for JSON serialization
      createdAt: brainrotDoc.data().createdAt?.toMillis() || null,
      updatedAt: brainrotDoc.data().updatedAt?.toMillis() || brainrotDoc.data().lastUpdated?.toMillis() || null,
      publishedAt: brainrotDoc.data().publishedAt?.toMillis() || null,
    };
    
    return NextResponse.json(brainrot);
  } catch (error) {
    console.error("Error fetching brainrot:", error);
    return NextResponse.json({ error: "Failed to fetch brainrot" }, { status: 500 });
  }
}

// PUT - Update a brainrot
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Safely handle params
    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json({ error: "Missing brainrot slug" }, { status: 400 });
    }

    const slug = String(resolvedParams.id);
    const collectionRef = adminDb.collection("brainrots");

    let brainrotDoc = await collectionRef.doc(slug).get();
    if (!brainrotDoc.exists) {
      const snapshot = await collectionRef.where("slug", "==", slug).limit(1).get();
      brainrotDoc = snapshot.empty ? brainrotDoc : snapshot.docs[0];
    }
    
    if (!brainrotDoc.exists) {
      return NextResponse.json({ error: "Brainrot not found" }, { status: 404 });
    }
    
    // Process form data
    const formData = await request.formData();
    
    // Extract form fields
    const name = formData.get("name");
    const rarity = formData.get("rarity");
    const demand = formData.get("demand");
    const valueLGC = parseFloat(formData.get("valueLGC"));
    const cost = formData.get("cost") || "";
    const isTopToday = formData.get("isTopToday") === "true";
    const isQuickTrade = formData.get("isQuickTrade") === "true";
    const published = formData.get("published") === "true";
    const image = formData.get("image");

    const enabledMutationIds = parseJsonFormField(formData.get("enabledMutationIds"), []) || [];
    const mutationOverridesRaw = parseJsonFormField(formData.get("mutationOverrides"), {}) || {};
    const enabledTraitIds = parseJsonFormField(formData.get("enabledTraitIds"), []) || [];
    const traitOverridesRaw = parseJsonFormField(formData.get("traitOverrides"), {}) || {};
    
    // Validation
    if (!name || !rarity || isNaN(valueLGC)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create slug from name if it doesn't exist
    let slugForDoc = brainrotDoc.data().slug;
    if (!slugForDoc) {
      slugForDoc = name.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Remove consecutive hyphens
    }
    
    // Handle image upload if provided
    let imageUrl = brainrotDoc.data().imageUrl;
    if (image && image instanceof File) {
      const fileExtension = (image.name?.split(".").pop() || "bin").toLowerCase();
      const objectKey = `brainrots/${slugForDoc}-${uuidv4()}.${fileExtension}`;
      imageUrl = await uploadImageToStorage({ file: image, objectKey });
    } else if (formData.get("imageUrl")) {
      // Use existing image URL if provided
      imageUrl = normalizeUrl(formData.get("imageUrl"));
    }
    
    if (!imageUrl) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const overridesById = {};
    for (const id of Array.isArray(enabledMutationIds) ? enabledMutationIds : []) {
      const safeId = String(id);
      const override = mutationOverridesRaw?.[safeId] || {};
      const nextOverride = {};
      if (override?.multiplier != null && Number.isFinite(Number(override.multiplier))) {
        nextOverride.multiplier = Number(override.multiplier);
      }

      const mutationImageFile = formData.get(`mutationImage_${safeId}`);
      if (mutationImageFile && mutationImageFile instanceof File) {
        const ext = (mutationImageFile.name?.split(".").pop() || "bin").toLowerCase();
        const objectKey = `brainrots/${slugForDoc}/mutations/${safeId}-${uuidv4()}.${ext}`;
        nextOverride.imageUrl = await uploadImageToStorage({ file: mutationImageFile, objectKey });
      } else if (override?.imageUrl) {
        nextOverride.imageUrl = normalizeUrl(override.imageUrl);
      }

      if (Object.keys(nextOverride).length > 0) overridesById[safeId] = nextOverride;
    }

    const traitOverridesById = {};
    for (const id of Array.isArray(enabledTraitIds) ? enabledTraitIds : []) {
      const safeId = String(id);
      const override = traitOverridesRaw?.[safeId] || {};
      const nextOverride = {};
      if (override?.multiplier != null && Number.isFinite(Number(override.multiplier))) {
        nextOverride.multiplier = Number(override.multiplier);
      }
      if (Object.keys(nextOverride).length > 0) traitOverridesById[safeId] = nextOverride;
    }

    const mutationsConfig = {
      enabledMutationIds: Array.isArray(enabledMutationIds) ? enabledMutationIds.map(String) : [],
      overridesById,
    };

    const traitsConfig = {
      enabledTraitIds: Array.isArray(enabledTraitIds) ? enabledTraitIds.map(String) : [],
      overridesById: traitOverridesById,
    };

    // Update brainrot document
    const brainrotData = {
      name: name.trim(),
      slug: slugForDoc,
      rarity,
      demand,
      valueLGC,
      cost: cost.trim(),
      imageUrl,
      isTopToday,
      isQuickTrade,
      published,
      mutationsConfig,
      traitsConfig,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Add published timestamp if published and not already published
    if (published && !brainrotDoc.data().publishedAt) {
      brainrotData.publishedAt = FieldValue.serverTimestamp();
    }

    // Update in Firestore
    await brainrotDoc.ref.update(brainrotData);
    
    return NextResponse.json({ 
      id: brainrotDoc.id,
      ...brainrotData,
      createdAt: brainrotDoc.data().createdAt?.toMillis() || null,
      updatedAt: Date.now(),
      publishedAt: published ? (brainrotDoc.data().publishedAt?.toMillis() || Date.now()) : null,
    });
  } catch (error) {
    console.error("Error updating brainrot:", error);
    return NextResponse.json({ error: "Failed to update brainrot" }, { status: 500 });
  }
}

// DELETE - Delete a brainrot
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Safely handle params
    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json({ error: "Missing brainrot slug" }, { status: 400 });
    }

    const slug = String(resolvedParams.id);
    const collectionRef = adminDb.collection("brainrots");

    let brainrotDoc = await collectionRef.doc(slug).get();
    if (!brainrotDoc.exists) {
      const snapshot = await collectionRef.where("slug", "==", slug).limit(1).get();
      brainrotDoc = snapshot.empty ? brainrotDoc : snapshot.docs[0];
    }
    
    if (!brainrotDoc.exists) {
      return NextResponse.json({ error: "Brainrot not found" }, { status: 404 });
    }
    
    // Delete the document
    await brainrotDoc.ref.delete();
    
    // TODO: Delete associated image from storage if needed
    
    return NextResponse.json({ message: "Brainrot deleted successfully" });
  } catch (error) {
    console.error("Error deleting brainrot:", error);
    return NextResponse.json({ error: "Failed to delete brainrot" }, { status: 500 });
  }
}
