import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Leon Pulse | 战术医疗终端',
  description: '你的私人赛博健康管家',
  manifest: '/manifest.json', // 👈 核心：告诉浏览器这是一张 App 的图纸
  themeColor: '#14b8a6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Leon Pulse',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
