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
