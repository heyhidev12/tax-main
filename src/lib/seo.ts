/**
 * SEO Utility Functions
 * Provides default SEO values and helper functions for meta tags
 */

export const SEO_CONFIG = {
  company: {
    koreanName: '세무법인함께',
    englishName: 'TOGETHER TAX',
  },
  default: {
    title: '세무법인함께 | 세무기장·경리대행·세무신고',
    description:
      '세무법인함께는 세무기장과 경리대행, 세무신고, 세무조사 대응까지 한 번에 해결하는 종합 세무법인입니다. 개인사업자·법인 맞춤 경리·세무 상담을 제공합니다.',
    keywords: [
      '세무사',
      '세무법인',
      '세무기장',
      '경리대행',
      '경리지원',
      '세무신고',
      '세무상담',
      '경리 아웃소싱',
      '외주 경리',
      '법인세',
      '종합소득세',
      '부가가치세',
      '세무조사',
      '절세',
    ].join(', '),
  },
  og: {
    image: '/favicon/og.png',
    type: 'website',
    locale: 'ko_KR',
  },
  organization: {
    name: '세무법인함께',
    address: '서울 서초구',
    phone: '02-522-5333',
    businessHours: 'Mon-Fri 09:00-18:00',
    kakaoChannel: 'https://pf.kakao.com/_xbLQgn',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://togethertax.co.kr',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://togethertax.co.kr'}/images/logo/logo_main.png`,
  },
};

/**
 * Generate meta title based on page type
 */
export function generateTitle(
  pageType: 'home' | 'menu' | 'content',
  menuName?: string,
  postTitle?: string
): string {
  const base = SEO_CONFIG.company.koreanName;

  switch (pageType) {
    case 'home':
      return SEO_CONFIG.default.title;
    case 'menu':
      return menuName ? `${menuName} | ${base}` : SEO_CONFIG.default.title;
    case 'content':
      return postTitle && menuName
        ? `${postTitle} | ${menuName} | ${base}`
        : menuName
          ? `${menuName} | ${base}`
          : SEO_CONFIG.default.title;
    default:
      return SEO_CONFIG.default.title;
  }
}

/**
 * Generate meta description
 */
export function generateDescription(customDescription?: string): string {
  return customDescription || SEO_CONFIG.default.description;
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = SEO_CONFIG.organization.url;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate Organization JSON-LD structured data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SEO_CONFIG.organization.name,
    url: SEO_CONFIG.organization.url,
    logo: SEO_CONFIG.organization.logo,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SEO_CONFIG.organization.phone,
      contactType: 'customer service',
      areaServed: 'KR',
      availableLanguage: 'Korean',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: SEO_CONFIG.organization.address,
      addressCountry: 'KR',
    },
    sameAs: [SEO_CONFIG.organization.kakaoChannel],
  };
}
