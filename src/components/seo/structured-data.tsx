/**
 * WHY: Helps search engines understand page content
 * IMPACT: Rich snippets in search results
 * PLACEMENT: In page.tsx or layout.tsx
 */
export function PersonStructuredData({
  name,
  description,
  url,
  image,
  sameAs,
}: {
  name: string;
  description: string;
  url: string;
  image?: string;
  sameAs?: string[];
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description,
    url,
    image,
    jobTitle: "Full Stack Developer",
    sameAs: sameAs || [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * BlogPosting Schema for individual blog posts
 * WHY: Enables rich snippets in search results with author, date, reading time
 * IMPACT: Better CTR from search results, enhanced visibility
 */
export function BlogPostingStructuredData({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author,
  authorUrl,
  keywords,
  readingTime,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  authorUrl?: string;
  keywords?: string[];
  readingTime?: number;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    image: image || "https://muzammilkhan.vercel.app/og-image.png",
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: author,
      url: authorUrl || "https://muzammilkhan.vercel.app",
    },
    publisher: {
      "@type": "Person",
      name: "Muhammad Muzammil",
      url: "https://muzammilkhan.vercel.app",
    },
    keywords: keywords?.join(", "),
    timeRequired: readingTime ? `PT${readingTime}M` : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * Organization Schema for brand identity
 * WHY: Helps search engines understand your brand
 * IMPACT: Knowledge graph, brand recognition
 */
export function OrganizationStructuredData({
  name,
  url,
  logo,
  sameAs,
  description,
}: {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  description?: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: logo || `${url}/logo.png`,
    description,
    sameAs: sameAs || [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * BreadcrumbList Schema for navigation hierarchy
 * WHY: Shows breadcrumb navigation in search results
 * IMPACT: Better UX in search results, clearer site structure
 */
export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * WebSite Schema with SearchAction
 * WHY: Enables site search box in Google search results
 * IMPACT: Direct search functionality from Google
 */
export function WebSiteStructuredData({
  name,
  url,
  description,
}: {
  name: string;
  url: string;
  description?: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/blog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
