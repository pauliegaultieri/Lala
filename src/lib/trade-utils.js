/**
 * Calculate the final value of a brainrot with mutation and traits applied
 * Formula: baseValue * (mutationMultiplier + sum of all trait multipliers)
 * 
 * @param {number} baseValueLGC - Base value in LGC units
 * @param {object|null} mutation - Selected mutation object with multiplier
 * @param {array} traits - Array of selected trait objects with multipliers
 * @returns {object} - Calculated values
 */
export function calculateBrainrotValue(baseValueLGC, mutation = null, traits = []) {
  const mutationMultiplier = mutation?.multiplier || 0;
  
  // Sum all trait multipliers
  let traitsMultiplier = 0;
  if (traits.length > 0) {
    for (const trait of traits) {
      traitsMultiplier += trait?.multiplier || 0;
    }
  }

  // Total multiplier is simply the sum of mutation + all traits
  const totalMultiplier = mutationMultiplier + traitsMultiplier;
  
  // If no modifiers are selected (totalMultiplier = 0), return base value
  // Otherwise apply the multiplier
  const finalValueLGC = totalMultiplier === 0 ? baseValueLGC : baseValueLGC * totalMultiplier;

  return {
    mutationMultiplier,
    traitsMultiplier,
    totalMultiplier,
    finalValueLGC: Math.round(finalValueLGC * 1000000) / 1000000, // 6 decimal precision
  };
}

/**
 * Calculate W/L/F result for a trade
 * From the poster's perspective:
 * - Win = receiving more value than giving
 * - Loss = giving more value than receiving
 * - Fair = within 5% difference
 * 
 * @param {number} offeringTotal - Total value of items being offered
 * @param {number} lookingForTotal - Total value of items being requested
 * @returns {object} - Result and percentage
 */
export function calculateTradeResult(offeringTotal, lookingForTotal) {
  const difference = lookingForTotal - offeringTotal;
  const maxValue = Math.max(offeringTotal, lookingForTotal);
  
  if (maxValue === 0) {
    return { result: "fair", percentage: 0 };
  }

  const percentDiff = (Math.abs(difference) / maxValue) * 100;

  // 5% threshold for "fair"
  if (percentDiff <= 5) {
    return { result: "fair", percentage: Math.round(percentDiff * 10) / 10 };
  }

  // From poster's perspective:
  // If offering more than receiving = Loss
  // If offering less than receiving = Win
  const result = difference > 0 ? "loss" : "win";
  
  return { 
    result, 
    percentage: Math.round(percentDiff * 10) / 10 
  };
}

function flipTradeResult(result) {
  if (result === "win") return "loss";
  if (result === "loss") return "win";
  return result;
}

export function getTradeResultForUser({ result, ownerRobloxId }, userRobloxId) {
  if (!result) return null;
  if (!userRobloxId) return result;
  if (!ownerRobloxId) return flipTradeResult(result);

  const isOwner = String(userRobloxId) === String(ownerRobloxId);
  return isOwner ? result : flipTradeResult(result);
}

/**
 * Format a trade item for submission to the API
 * 
 * @param {object} item - Selected item from SelectItemModal
 * @param {object|null} mutation - Selected mutation (optional)
 * @param {array} traits - Selected traits (optional)
 * @returns {object} - Formatted trade item
 */
export function formatTradeItem(item, mutation = null, traits = []) {
  // Get base value from item (valueLGC from Firestore)
  const baseValueLGC = item.valueLGC || 0;
  
  // Calculate final value with modifiers
  const { mutationMultiplier, traitsMultiplier, finalValueLGC } = calculateBrainrotValue(
    baseValueLGC,
    mutation,
    traits
  );

  return {
    brainrotId: item.id,
    brainrotSlug: item.slug || item.id,
    name: item.name,
    imageUrl: item.imageUrl || item.img || "/images/temp/roblox.webp",
    rarity: item.rarity,
    
    baseValueLGC,
    
    mutation: mutation?.slug || mutation?.id || null,
    mutationMultiplier,
    mutationName: mutation?.name || null,
    mutationColor: mutation?.color || null,
    
    traits: traits.map(t => t.slug || t.id),
    traitNames: traits.map(t => t.name),
    traitColors: traits.map(t => t.color),
    traitsMultiplier,
    
    finalValueLGC,
  };
}

/**
 * Format time ago string from a date
 * 
 * @param {string|Date} date - Date to format
 * @returns {string} - Human readable time ago string
 */
export function formatTimeAgo(date) {
  if (!date) return "Unknown";
  
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  }
  if (diffWeeks > 0) {
    return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  }
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }
  if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

/**
 * Format LGC value for display
 * 
 * @param {number} value - Value in LGC
 * @returns {string} - Formatted string
 */
export function formatLGCValue(value) {
  if (value === null || value === undefined) return "0";
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  if (value >= 1) {
    return value.toFixed(3);
  }
  if (value >= 0.001) {
    return value.toFixed(2);
  }
  if (value > 0) {
    return `< 0.001`;
  }
  return "0";
}

export function normalizeTradeItemsForTooltip(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(Boolean).map((item) => {
    const mutationName =
      item?.mutationData?.name ||
      item?.mutation?.name ||
      item?.mutationName ||
      (typeof item?.mutation === "string" ? item.mutation : null);

    const mutationColor =
      item?.mutationData?.color ||
      item?.mutation?.color ||
      item?.mutationColor ||
      null;

    const mutationGradient =
      item?.mutationData?.gradient ||
      item?.mutation?.gradient ||
      item?.mutationGradient ||
      null;

    const mutation = mutationName
      ? {
          name: mutationName,
          ...(mutationColor ? { color: mutationColor } : {}),
          ...(mutationGradient ? { gradient: mutationGradient } : {}),
        }
      : null;

    const rawTraits =
      Array.isArray(item?.traits) && item.traits.length > 0
        ? item.traits
        : Array.isArray(item?.traitNames) && item.traitNames.length > 0
        ? item.traitNames
        : [];

    const rawTraitColors = Array.isArray(item?.traitColors) ? item.traitColors : [];

    const traits = rawTraits
      .filter(Boolean)
      .map((trait, idx) => {
        if (typeof trait === "object" && trait?.name) return trait;
        const name = String(trait);
        const color = rawTraitColors[idx] || null;
        return {
          name,
          ...(color ? { color } : {}),
        };
      });

    return {
      name: item?.name || "Unknown",
      imageUrl: item?.imageUrl || item?.img || "/images/temp/roblox.webp",
      value: item?.value !== undefined && item?.value !== null ? item.value : formatLGCValue(item?.finalValueLGC),
      mutation,
      traits,
      tags: [mutation?.name, ...traits.map((t) => t?.name)].filter(Boolean),
    };
  });
}
