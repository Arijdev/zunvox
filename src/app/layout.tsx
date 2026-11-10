import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { siteUrl } from "@/lib/site";
import { siteDescription } from "@/lib/seo";
import { ThemeProvider } from "@/components/ThemeProvider";
import JsonLd from "./JsonLd";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist" });
const keywords = [
  "Zunvox client-side utility suite",
  "client side utility suite",
  "private PDF tools",
  "secure AI document processing",
  "fast client-side tools",
  "local file processing",
  "client-side PDF compressor",
  "browser OCR tool",
  "free document summarizer",
  "private file converter",
  "in-browser file utilities",
  "local AI proofreading",
  "PDF merger",
  "PDF splitter",
];

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Zunvox | Client-Side Utility Suite for Private PDF Tools",
    template: "%s | Zunvox",
  },
  description: siteDescription,
  keywords,
  applicationName: "Zunvox",
  category: "Utilities",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Zunvox",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/zunvox-192.png", sizes: "192x192", type: "image/png" },
      { url: "/zunvox-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/zunvox-apple-touch-icon.png", sizes: "180x180" }],
  },
  alternates: { canonical: new URL("/", siteUrl) },
  openGraph: {
    type: "website",
    siteName: "Zunvox",
    title: "Zunvox | Client-Side Utility Suite for Private PDF Tools",
    description: siteDescription,
    url: siteUrl.toString(),
    images: [
      {
        url: new URL("/og-image", siteUrl),
        width: 1200,
        height: 630,
        alt: "Zunvox — Private file utilities and on-device AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zunvox | Client-Side Utility Suite for Private PDF Tools",
    description: siteDescription,
    images: [
      {
        url: new URL("/og-image", siteUrl),
        alt: "Zunvox — Private file utilities and on-device AI",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const applicationUrl = siteUrl.toString();
  const applicationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${applicationUrl}#website`,
        name: "Zunvox",
        url: applicationUrl,
        description: siteDescription,
        inLanguage: "en",
        publisher: {
          "@type": "Organization",
          "@id": `${applicationUrl}#organization`,
          name: "Zunvox",
          url: applicationUrl,
        },
      },
      {
        "@type": "WebApplication",
        name: "Zunvox",
        description: siteDescription,
        url: applicationUrl,
        isPartOf: { "@id": `${applicationUrl}#website` },
        inLanguage: "en",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any operating system with a modern web browser",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0.00",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Zunvox",
        description: siteDescription,
        url: applicationUrl,
        inLanguage: "en",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any operating system with a modern web browser",
        offers: {
          "@type": "Offer",
          price: "0.00",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://huggingface.co" />
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full">
        <JsonLd data={applicationSchema} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
