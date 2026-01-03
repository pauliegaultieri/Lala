export const RARITIES = [
  {
    id: "common",
    name: "Common",
    order: 1,
    color: "#9CA3AF",
    image: "/images/temp/categories/common.png",
    showAsCategory: true,
  },
  {
    id: "rare",
    name: "Rare",
    order: 2,
    color: "#3B82F6",
    image: "/images/temp/categories/rare.png",
    showAsCategory: true,
  },
  {
    id: "epic",
    name: "Epic",
    order: 3,
    color: "#8B5CF6",
    image: "/images/temp/categories/epic.png",
    showAsCategory: true,
  },
  {
    id: "legendary",
    name: "Legendary",
    order: 4,
    color: "#F59E0B",
    image: "/images/temp/categories/legendary.png",
    showAsCategory: true,
  },
  {
    id: "mythic",
    name: "Mythic",
    order: 5,
    color: "#EC4899",
    image: "/images/temp/categories/mythic.png",
    showAsCategory: true,
  },
  {
    id: "brainrot-god",
    name: "Brainrot God",
    order: 6,
    color: "#EF4444",
    image: "/images/temp/categories/brainrot-god.png",
    showAsCategory: true,
  },
  {
    id: "secret",
    name: "Secret",
    order: 7,
    color: "#10B981",
    image: "/images/temp/categories/secret.png",
    showAsCategory: true,
  },
  {
    id: "og",
    name: "OG",
    order: 8,
    color: "#F97316",
    image: "/images/temp/categories/og.png",
    showAsCategory: true,
  },
  {
    id: "admin",
    name: "Admin",
    order: 9,
    color: "#a67c00",
    image: "/images/temp/categories/og.png",
    showAsCategory: false,
  },
];

export function getRarityById(id) {
  return RARITIES.find((r) => r.id === id);
}

export function getRarityColor(id) {
  return getRarityById(id)?.color || "#9CA3AF";
}

export function getRarityName(id) {
  return getRarityById(id)?.name || id;
}

export function getCategoryRarities() {
  return RARITIES.filter((r) => r.showAsCategory);
}
