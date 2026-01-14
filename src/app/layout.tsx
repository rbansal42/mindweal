import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { appConfig } from "@/config";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: appConfig.title,
    template: `%s | ${appConfig.name}`,
  },
  description: appConfig.description,
  keywords: [
    "mental health",
    "therapy",
    "counseling",
    "wellness",
    "mindweal",
    "psychology",
    "mental wellness",
  ],
  authors: [{ name: appConfig.name }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: appConfig.name,
    title: appConfig.title,
    description: appConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: appConfig.title,
    description: appConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
