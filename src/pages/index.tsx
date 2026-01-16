import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Home, { BannerMedia } from '@/components/Home';
import { get } from '@/lib/api-server';
import { API_ENDPOINTS } from '@/config/api';

interface HomePageProps {
  heroBanner: BannerMedia | null;
}

export default function HomePage({ heroBanner }: HomePageProps) {
  return (
    <>
      <Head>
        <title>세무법인 함께 - Tax Accounting Together</title>
        <meta
          name="description"
          content="고객이 걸어갈 길, 세무법인 함께가 동행합니다. 믿고 맡길 수 있는 세무 파트너, 세무법인 함께"
        />
        <meta property="og:title" content="세무법인 함께 - Tax Accounting Together" />
        <meta
          property="og:description"
          content="고객이 걸어갈 길, 세무법인 함께가 동행합니다"
        />
        <meta property="og:type" content="website" />
      </Head>
      <Home heroBanner={heroBanner} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  try {
    const response = await get<BannerMedia[]>(API_ENDPOINTS.BANNERS);
    
    let heroBanner: BannerMedia | null = null;
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const sorted = [...response.data].sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      );
      heroBanner = sorted[0];
    }

    return {
      props: {
        heroBanner,
      },
    };
  } catch (error) {
    console.error('Failed to fetch banner data:', error);
    // 에러 발생 시에도 페이지는 렌더링 (heroBanner는 null)
    return {
      props: {
        heroBanner: null,
      },
    };
  }
};
