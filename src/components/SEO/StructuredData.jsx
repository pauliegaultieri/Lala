/**
 * StructuredData Component
 * Renders JSON-LD structured data for SEO
 * Supports multiple schema types: Product, ItemList, FAQ, Breadcrumb, WebSite
 */

export default function StructuredData({ data }) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      suppressHydrationWarning
    />
  );
}

/**
 * Generate Product Schema for Brainrot pages
 */
export function generateProductSchema({ brainrot, baseUrl = "https://sabrvalues.com" }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": brainrot.name,
    "image": brainrot.imageUrl || `${baseUrl}/images/temp/roblox.webp`,
    "description": `${brainrot.rarity} rarity brainrot in Steal a Brainrot. Current value: ${brainrot.valueLGC} LGC. ${brainrot.demand ? `Demand: ${brainrot.demand}.` : ''}`,
    "brand": {
      "@type": "Brand",
      "name": "Steal a Brainrot"
    },
    "offers": {
      "@type": "Offer",
      "price": brainrot.valueLGC || "0",
      "priceCurrency": "LGC",
      "availability": "https://schema.org/InStock",
      "url": `${baseUrl}/values/brainrots/${brainrot.slug || brainrot.id}`
    },
    "category": brainrot.rarity,
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Rarity",
        "value": brainrot.rarity
      },
      {
        "@type": "PropertyValue",
        "name": "Demand",
        "value": brainrot.demand || "unknown"
      }
    ]
  };
}

/**
 * Generate ItemList Schema for Category pages
 */
export function generateItemListSchema({ items, name, description, baseUrl = "https://sabrvalues.com" }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": name,
    "description": description,
    "numberOfItems": items.length,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": item.name,
        "url": `${baseUrl}/values/brainrots/${item.slug || item.id}`,
        "image": item.imageUrl,
        "offers": {
          "@type": "Offer",
          "price": item.valueLGC || "0",
          "priceCurrency": "LGC"
        }
      }
    }))
  };
}

/**
 * Generate FAQ Schema for FAQ pages
 */
export function generateFAQSchema({ faqs }) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate BreadcrumbList Schema
 */
export function generateBreadcrumbSchema({ items, baseUrl = "https://sabrvalues.com" }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url ? `${baseUrl}${item.url}` : undefined
    }))
  };
}

/**
 * Generate WebSite Schema with SearchAction
 */
export function generateWebSiteSchema({ baseUrl = "https://sabrvalues.com" }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Sabrvalues",
    "alternateName": "Steal a Brainrot Values",
    "url": baseUrl,
    "description": "Valuation data, statistics, and trading utilities for Steal a Brainrot. Check brainrot values, calculate trades, and browse the complete item database.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/values/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate Organization Schema
 */
export function generateOrganizationSchema({ baseUrl = "https://sabrvalues.com" }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sabrvalues",
    "url": baseUrl,
    "logo": `${baseUrl}/images/og-thumbnail.webp`,
    "description": "The leading platform for Steal a Brainrot valuations and trading",
    "sameAs": [
      // Add social media links when available
    ]
  };
}

/**
 * Generate Article Schema for Guides
 */
export function generateArticleSchema({ guide, baseUrl = "https://sabrvalues.com" }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": guide.title,
    "description": guide.description || guide.excerpt,
    "image": guide.imageUrl || `${baseUrl}/images/og-thumbnail.webp`,
    "author": {
      "@type": "Organization",
      "name": "Sabrvalues Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sabrvalues",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/og-thumbnail.webp`
      }
    },
    "datePublished": guide.createdAt,
    "dateModified": guide.updatedAt || guide.createdAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/guides/${guide.slug || guide.id}`
    }
  };
}
