export async function generateMetadata({ params }) {
  const categoryId = (await params).category;
  
  let categoryName;
  if (categoryId.toUpperCase() === "OG") {
    categoryName = "OG";
  } else {
    categoryName = categoryId.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  }
  
  const descriptions = {
    "common": "Browse all Common rarity brainrots with their current values, mutations, and traits.",
    "rare": "Browse all Rare rarity brainrots with their current values, mutations, and traits.",
    "epic": "Browse all Epic rarity brainrots with their current values, mutations, and traits.",
    "legendary": "Browse all Legendary rarity brainrots with their current values, mutations, and traits.",
    "mythic": "Browse all Mythic rarity brainrots with their current values, mutations, and traits.",
    "brainrot-god": "Browse all Brainrot God rarity brainrots with their current values, mutations, and traits.",
    "secret": "Browse all Secret rarity brainrots with their current values, mutations, and traits.",
    "og": "Browse all OG rarity brainrots - the rarest items in Steal a Brainrot with their current values.",
  };
  
  const description = descriptions[categoryId.toLowerCase()] || 
    `Browse all ${categoryName} rarity brainrots with their current values, mutations, and traits.`;
  
  return {
    title: `${categoryName} Brainrots - Values & Stats | Sabrvalues`,
    description: description,
    openGraph: {
      title: `${categoryName} Brainrots | Sabrvalues`,
      description: description,
      type: "website",
    },
  };
}

export default function CategoryLayout({ children }) {
  return children;
}
