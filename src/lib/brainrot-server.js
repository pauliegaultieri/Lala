import { adminDb } from "@/lib/firebase-admin";

/**
 * Server-side function to fetch a single brainrot by slug
 * Used for SSR in brainrot detail pages
 */
export async function getBrainrotBySlug(slug) {
  try {
    if (!slug) return null;
    
    const collectionRef = adminDb.collection("brainrots");
    
    // Try by document ID first
    let doc = await collectionRef.doc(slug).get();
    
    // If not found, try by slug field
    if (!doc.exists) {
      const snapshot = await collectionRef.where("slug", "==", slug).limit(1).get();
      doc = snapshot.empty ? doc : snapshot.docs[0];
    }
    
    if (!doc.exists) return null;
    
    const data = doc.data() || {};
    const createdAt = typeof data?.createdAt?.toDate === "function" 
      ? data.createdAt.toDate().toISOString() 
      : data.createdAt || null;
    const updatedAt = typeof data?.updatedAt?.toDate === "function" 
      ? data.updatedAt.toDate().toISOString() 
      : data.updatedAt || null;
    
    return {
      id: doc.id,
      ...data,
      createdAt,
      updatedAt,
    };
  } catch (error) {
    console.error("Error fetching brainrot:", error);
    return null;
  }
}

/**
 * Get all brainrot slugs for static generation
 */
export async function getAllBrainrotSlugs() {
  try {
    const snapshot = await adminDb.collection("brainrots").get();
    return snapshot.docs
      .map((doc) => doc.data()?.slug || doc.id)
      .filter(Boolean);
  } catch (error) {
    console.error("Error fetching brainrot slugs:", error);
    return [];
  }
}
