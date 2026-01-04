import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin";
import { isSessionAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";
import { revalidateTag } from "next/cache";
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

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json({ error: "Missing rarity ID" }, { status: 400 });
    }

    const rarityDoc = await adminDb.collection("rarities").doc(resolvedParams.id).get();
    
    if (!rarityDoc.exists) {
      return NextResponse.json({ error: "Rarity not found" }, { status: 404 });
    }
    
    const rarity = {
      id: rarityDoc.id,
      ...rarityDoc.data(),
      createdAt: rarityDoc.data().createdAt?.toMillis() || null,
      updatedAt: rarityDoc.data().updatedAt?.toMillis() || null,
    };
    
    return NextResponse.json(rarity);
  } catch (error) {
    console.error("Error fetching rarity:", error);
    return NextResponse.json({ error: "Failed to fetch rarity" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json({ error: "Missing rarity ID" }, { status: 400 });
    }

    const rarityDoc = await adminDb.collection("rarities").doc(resolvedParams.id).get();
    
    if (!rarityDoc.exists) {
      return NextResponse.json({ error: "Rarity not found" }, { status: 404 });
    }
    
    const formData = await request.formData();
    const label = formData.get("label");
    const color = formData.get("color");
    const order = formData.get("order");
    const showInForm = formData.get("showInForm");
    const imageFile = formData.get("image");
    const existingImageUrl = formData.get("existingImageUrl");
    
    if (!label || !color) {
      return NextResponse.json({ error: "Missing required fields (label, color)" }, { status: 400 });
    }

    let imageUrl = existingImageUrl || rarityDoc.data().image || null;

    // Upload new image to R2 if provided
    if (imageFile && imageFile instanceof File) {
      const fileExtension = (imageFile.name?.split(".").pop() || "bin").toLowerCase();
      const objectKey = `rarities/${resolvedParams.id}-${uuidv4()}.${fileExtension}`;
      imageUrl = await uploadImageToStorage({ file: imageFile, objectKey });
    }

    const rarityData = {
      label: label.trim(),
      color: color.trim(),
      image: imageUrl,
      order: parseInt(order) || rarityDoc.data().order || 0,
      showInForm: showInForm === "true",
      updatedAt: FieldValue.serverTimestamp(),
    };

    await rarityDoc.ref.update(rarityData);
    
    // Invalidate cache
    revalidateTag("rarities");
    
    return NextResponse.json({ 
      id: rarityDoc.id,
      ...rarityData,
      createdAt: rarityDoc.data().createdAt?.toMillis() || null,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Error updating rarity:", error);
    return NextResponse.json({ error: "Failed to update rarity" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json({ error: "Missing rarity ID" }, { status: 400 });
    }

    const rarityDoc = await adminDb.collection("rarities").doc(resolvedParams.id).get();
    
    if (!rarityDoc.exists) {
      return NextResponse.json({ error: "Rarity not found" }, { status: 404 });
    }
    
    await rarityDoc.ref.delete();
    
    // Invalidate cache
    revalidateTag("rarities");
    
    return NextResponse.json({ message: "Rarity deleted successfully" });
  } catch (error) {
    console.error("Error deleting rarity:", error);
    return NextResponse.json({ error: "Failed to delete rarity" }, { status: 500 });
  }
}
