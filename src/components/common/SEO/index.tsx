/**
 * SEO Component
 * Handles meta tags, Open Graph, and structured data
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  SEO_CONFIG,
  generateTitle,
  generateDescription,
  generateCanonicalUrl,
  generateOrganizationSchema,
} from '@/lib/seo';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  pageType?: 'home' | 'menu' | 'content';
  menuName?: string;
  postTitle?: string;
  structuredData?: object | object[];
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogType,
  canonical,
  noindex = false,
  nofollow = false,
  pageType = 'home',
  menuName,
  postTitle,
  structuredData,
}: SEOProps) {
  const router = useRouter();

  // Generate title based on page type if not provided
  const metaTitle = title || generateTitle(pageType, menuName, postTitle);
  const metaDescription = generateDescription(description);
  const metaKeywords = keywords || SEO_CONFIG.default.keywords;
  const canonicalUrl = canonical || generateCanonicalUrl(router.asPath.split('?')[0]);
  const ogImageUrl = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${SEO_CONFIG.organization.url}${ogImage}`
    : `${SEO_CONFIG.organization.url}${SEO_CONFIG.og.image}`;

  // Default structured data (Organization)
  const defaultStructuredData = generateOrganizationSchema();
  const allStructuredData = structuredData
    ? Array.isArray(structuredData)
      ? [defaultStructuredData, ...structuredData]
      : [defaultStructuredData, structuredData]
    : [defaultStructuredData];

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex" />}
      {nofollow && <meta name="robots" content="nofollow" />}
      {!noindex && !nofollow && <meta name="robots" content="index, follow" />}

      {/* Open Graph */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:type" content={ogType || SEO_CONFIG.og.type} />
      <meta property="og:locale" content={SEO_CONFIG.og.locale} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SEO_CONFIG.company.koreanName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Structured Data (JSON-LD) */}
      {allStructuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Head>
  );
}
