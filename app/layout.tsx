import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/lib/db/queries';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'InnoHub - 商机共振平台',
  description: '基于DeepSeek大模型的企业需求与供应商智能匹配平台',
  keywords: ['商机共振', '企业匹配', '需求对接', '供应商', '东升园区', 'AI匹配'],
  authors: [{ name: 'InnoHub Team' }],
  creator: 'InnoHub',
  publisher: 'InnoHub',
  openGraph: {
    title: 'InnoHub - 商机共振平台',
    description: '基于DeepSeek大模型的企业需求与供应商智能匹配平台',
    url: 'https://innohub.com',
    siteName: 'InnoHub',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InnoHub - 商机共振平台',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InnoHub - 商机共振平台',
    description: '基于DeepSeek大模型的企业需求与供应商智能匹配平台',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

const manrope = Manrope({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userPromise = getUser();

  return (
    <html
      lang="zh-CN"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50" suppressHydrationWarning>
        <UserProvider userPromise={userPromise}>{children}</UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
