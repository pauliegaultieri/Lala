import { adminDb } from "@/lib/firebase-admin";
import StructuredData, { generateProductSchema, generateBreadcrumbSchema } from "@/components/SEO/StructuredData";

async function getBrainrot(slug) {
  try {
    const collectionRef = adminDb.collection("brainrots");
    let doc = await collectionRef.doc(slug).get();
    
    if (!doc.exists) {
      const snapshot = await collectionRef.where("slug", "==", slug).limit(1).get();
      doc = snapshot.empty ? doc : snapshot.docs[0];
    }
    
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const brainrotSlug = (await params).brainrot;
  const brainrot = await getBrainrot(brainrotSlug);
  
  if (!brainrot) {
    return {
      title: "Brainrot Not Found | Sabrvalues",
      description: "The requested brainrot could not be found.",
    };
  }

  const name = brainrot.name || brainrotSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const rarity = brainrot.rarity ? String(brainrot.rarity).split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "";
  const value = brainrot.valueLGC || 0;
  
  return {
    title: `${name} Value - ${value} LGC | Sabrvalues`,
    description: `Current value for ${name} in Steal a Brainrot: ${value} LGC. ${rarity ? `${rarity} rarity.` : ""} Check mutations, traits, and trading info. Updated daily.`,
    keywords: [
      name,
      `${name} value`,
      `${name} steal a brainrot`,
      rarity ? `${rarity} brainrot` : "brainrot",
      "steal a brainrot values",
      "brainrot trading",
      brainrot.demand || "brainrot demand"
    ],
    alternates: {
      canonical: `https://sabrvalues.com/values/brainrots/${brainrotSlug}`,
    },
    openGraph: {
      title: `${name} - ${value} LGC`,
      description: `${rarity ? `${rarity} rarity` : "Brainrot"} worth ${value} LGC in Steal a Brainrot. Check current value, mutations, and traits.`,
      images: brainrot.imageUrl ? [{ url: brainrot.imageUrl, width: 800, height: 800, alt: name }] : [],
      type: "article",
      url: `https://sabrvalues.com/values/brainrots/${brainrotSlug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} - ${value} LGC`,
      description: `${rarity ? `${rarity} rarity` : "Brainrot"} worth ${value} LGC`,
      images: brainrot.imageUrl ? [brainrot.imageUrl] : [],
    },
  };
}

export default async function BrainrotLayout({ children, params }) {
  const brainrotSlug = (await params).brainrot;
  const brainrot = await getBrainrot(brainrotSlug);
  
  if (!brainrot) {
    return children;
  }

  const name = brainrot.name || brainrotSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const rarity = brainrot.rarity ? String(brainrot.rarity).split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "";

  const productSchema = generateProductSchema({
    brainrot,
    baseUrl: "https://sabrvalues.com"
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: "/" },
      { name: "Values", url: "/values" },
      { name: rarity || "Brainrot", url: `/values/categories/${brainrot.rarity}` },
      { name: name }
    ],
    baseUrl: "https://sabrvalues.com"
  });

  return (
    <>
      <StructuredData data={productSchema} />
      <StructuredData data={breadcrumbSchema} />
      {children}
    </>
  );
}
