import { adminDb } from "@/lib/firebase-admin";

async function getAllBrainrotSlugs() {
  try {
    const snapshot = await adminDb.collection("brainrots").get();
    return snapshot.docs
      .map((doc) => doc.data()?.slug || doc.id)
      .filter(Boolean);
  } catch (error) {
    return [];
  }
}

async function getAllRarities() {
  try {
    const snapshot = await adminDb.collection("rarities").orderBy("order").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    return [];
  }
}

export default async function sitemap() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://sabrvalues.com";

  const brainrots = await getAllBrainrotSlugs();
  const rarities = await getAllRarities();

  const brainrotUrls = brainrots.map((slug) => ({
    url: `${baseUrl}/values/brainrots/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const rarityUrls = rarities.map((rarity) => ({
    url: `${baseUrl}/values/categories/${rarity.id}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/values`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trades`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trades/completed`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/credits`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...rarityUrls,
    ...brainrotUrls,
  ];
}
