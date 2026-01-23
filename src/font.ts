import localFont from 'next/font/local';

export const aritaDotum = localFont({
  src: [
    {
      path: '../public/fonts/AritaBuriKR-HairLine.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/fonts/AritaBuriKR-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/AritaBuriKR-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/AritaBuriKR-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/AritaBuriKR-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-arita',
  display: 'swap',
});
