/**
 * Dynamic Sitemap Generation
 * Generates sitemap.xml for SEO
 */

import { GetServerSideProps } from 'next';
import { get } from '@/lib/api-server';
import { API_ENDPOINTS } from '@/config/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://togethertax.co.kr';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function generateSitemap(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(
      (url) => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority !== undefined ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const urls: SitemapUrl[] = [];

  // Home page (highest priority)
  urls.push({
    loc: `${SITE_URL}/`,
    changefreq: 'daily',
    priority: 1.0,
  });

  // Main menu pages (high priority)
  const mainPages = [
    { path: '/business-areas/hierarchical', priority: 0.9 },
    { path: '/experts', priority: 0.9 },
    { path: '/education', priority: 0.8 },
    { path: '/history', priority: 0.8 },
    { path: '/insights', priority: 0.8 },
    { path: '/consultation/apply', priority: 0.7 },
  ];

  mainPages.forEach((page) => {
    urls.push({
      loc: `${SITE_URL}${page.path}`,
      changefreq: 'weekly',
      priority: page.priority,
    });
  });

  // Dynamic content pages
  try {
    // Business Areas
    const businessAreasResponse = await get<Array<{ id: number }>>(
      `${API_ENDPOINTS.BUSINESS_AREAS}?page=1&limit=100`
    ).catch(() => ({ data: [] }));

    if (businessAreasResponse.data) {
      businessAreasResponse.data.forEach((item) => {
        urls.push({
          loc: `${SITE_URL}/business-areas/${item.id}`,
          changefreq: 'monthly',
          priority: 0.7,
        });
      });
    }

    // Experts
    const expertsResponse = await get<{ items: Array<{ id: number }> }>(
      `${API_ENDPOINTS.MEMBERS}?page=1&limit=100`
    ).catch(() => ({ data: { items: [] } }));

    if (expertsResponse.data?.items) {
      expertsResponse.data.items.forEach((expert) => {
        urls.push({
          loc: `${SITE_URL}/experts/${expert.id}`,
          changefreq: 'monthly',
          priority: 0.7,
        });
      });
    }

    // Insights/Articles
    const insightsResponse = await get<{ items: Array<{ id: number }> }>(
      `${API_ENDPOINTS.INSIGHTS}?page=1&limit=100`
    ).catch(() => ({ data: { items: [] } }));

    if (insightsResponse.data?.items) {
      insightsResponse.data.items.forEach((insight) => {
        urls.push({
          loc: `${SITE_URL}/insights/${insight.id}`,
          changefreq: 'weekly',
          priority: 0.6,
        });
      });
    }

    // Education/Training Seminars
    const educationResponse = await get<{ items: Array<{ id: number }> }>(
      `${API_ENDPOINTS.TRAINING_SEMINARS}?page=1&limit=100`
    ).catch(() => ({ data: { items: [] } }));

    if (educationResponse.data?.items) {
      educationResponse.data.items.forEach((item) => {
        urls.push({
          loc: `${SITE_URL}/education/${item.id}`,
          changefreq: 'weekly',
          priority: 0.6,
        });
      });
    }
  } catch (error) {
    console.error('Error fetching dynamic content for sitemap:', error);
  }

  const sitemap = generateSitemap(urls);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

// This component is never rendered
export default function Sitemap() {
  return null;
}
