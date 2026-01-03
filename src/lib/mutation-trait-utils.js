import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Cache for mutations and traits data
let mutationsCache = null;
let traitsCache = null;

// Fetch mutations from Firestore
async function fetchMutations() {
  if (mutationsCache) return mutationsCache;
  
  try {
    const mutationsRef = collection(db, 'mutations');
    const snapshot = await getDocs(mutationsRef);
    mutationsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return mutationsCache;
  } catch (error) {
    console.error('Error fetching mutations:', error);
    return [];
  }
}

// Fetch traits from Firestore
async function fetchTraits() {
  if (traitsCache) return traitsCache;
  
  try {
    const traitsRef = collection(db, 'traits');
    const snapshot = await getDocs(traitsRef);
    traitsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return traitsCache;
  } catch (error) {
    console.error('Error fetching traits:', error);
    return [];
  }
}

// Helper to get mutation data by name or ID
export async function getMutationData(mutationNameOrId) {
  if (!mutationNameOrId) return null;
  
  const mutations = await fetchMutations();
  const mutation = mutations.find(m => 
    m.name?.toLowerCase() === mutationNameOrId.toLowerCase() || 
    m.id?.toLowerCase() === mutationNameOrId.toLowerCase()
  );
  
  if (!mutation) return null;
  
  // Handle different gradient formats from Firestore
  let gradient = null;
  if (mutation.gradient) {
    if (Array.isArray(mutation.gradient)) {
      // Rainbow gradient array format: ["#FF0000", "#FF7F00", ...]
      gradient = {
        colors: mutation.gradient
      };
    } else if (mutation.gradient.from && mutation.gradient.to) {
      // Standard from/to gradient format
      gradient = {
        from: mutation.gradient.from,
        to: mutation.gradient.to,
        angle: mutation.gradient.angle || 90
      };
    }
  }
  
  // Return mutation with proper color/gradient structure
  return {
    name: mutation.name,
    color: mutation.color,
    gradient: gradient
  };
}

// Helper to get trait data by name or ID
export async function getTraitData(traitNameOrId) {
  if (!traitNameOrId) return null;
  
  const traits = await fetchTraits();
  const trait = traits.find(t => 
    t.name?.toLowerCase() === traitNameOrId.toLowerCase() || 
    t.id?.toLowerCase() === traitNameOrId.toLowerCase()
  );
  
  if (!trait) return null;
  
  // Return trait with proper color structure
  return {
    name: trait.name,
    color: trait.color,
    icon: trait.icon
  };
}

// Helper to format mutation object for display
export async function formatMutationForDisplay(mutation) {
  if (!mutation) return null;
  
  // If it's already a properly formatted object, return as-is
  if (mutation.name && (mutation.color || mutation.gradient)) {
    return mutation;
  }
  
  // If it's a string, look up the data
  if (typeof mutation === 'string') {
    return await getMutationData(mutation);
  }
  
  // If it's an object with name but no color, look up the color
  if (mutation.name) {
    const data = await getMutationData(mutation.name);
    return data || {
      name: mutation.name,
      color: '#4F46E5' // Default purple color
    };
  }
  
  return null;
}

// Helper to format trait object for display
export async function formatTraitForDisplay(trait) {
  if (!trait) return null;
  
  // If it's already a properly formatted object, return as-is
  if (trait.name && trait.color) {
    return trait;
  }
  
  // If it's a string, look up the data
  if (typeof trait === 'string') {
    return await getTraitData(trait);
  }
  
  // If it's an object with name but no color, look up the color
  if (trait.name) {
    const data = await getTraitData(trait.name);
    return data || {
      name: trait.name,
      color: '#6B7280' // Default gray color
    };
  }
  
  return null;
}

// Batch format multiple mutations
export async function formatMutationsForDisplay(mutations) {
  if (!mutations || !Array.isArray(mutations)) return [];
  const formatted = await Promise.all(
    mutations.map(mutation => formatMutationForDisplay(mutation))
  );
  return formatted.filter(Boolean);
}

// Batch format multiple traits
export async function formatTraitsForDisplay(traits) {
  if (!traits || !Array.isArray(traits)) return [];
  const formatted = await Promise.all(
    traits.map(trait => formatTraitForDisplay(trait))
  );
  return formatted.filter(Boolean);
}
