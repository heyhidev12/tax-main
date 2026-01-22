import localFont from 'next/font/local';

export const aritaDotum = localFont({
  src: [
    {
      path: '../public/fonts/arita/AritaDotumKR-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/fonts/arita/AritaDotumKR-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/arita/AritaDotumKR-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/arita/AritaDotumKR-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/arita/AritaDotumKR-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-arita',
  display: 'swap',
});
