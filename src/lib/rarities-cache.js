// Real-time rarities fetching (no cache)
export async function getRarities() {
  try {
    const res = await fetch('/api/rarities', {
      cache: 'no-store' // Disable Next.js caching
    });
    if (!res.ok) {
      throw new Error('Failed to fetch rarities');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching rarities:', error);
    return [];
  }
}

export function invalidateRaritiesCache() {
  // No-op: cache is disabled, always fetches fresh data
}

// For server-side usage
export async function getRaritiesServer() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/rarities`, {
      next: { tags: ['rarities'], revalidate: 3600 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch rarities');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching rarities:', error);
    return [];
  }
}
