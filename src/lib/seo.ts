import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

export const siteDescription =
  "Zunvox is a client-side utility suite for private PDF tools, secure AI document processing, OCR, and file conversion—processed locally without uploads.";

export const faqItems = [
  {
    question: "Are my files uploaded to a server?",
    answer:
      "No. File processing runs locally in your browser. Your files are not uploaded to Zunvox servers.",
  },
  {
    question: "Is Zunvox free to use?",
    answer:
      "Yes. Zunvox file utilities and AI tools are free to use, with no account or login required.",
  },
  {
    question: "Does Zunvox require an account?",
    answer:
      "No. You can use Zunvox as a guest without creating an account.",
  },
  {
    question: "Can I use Zunvox AI tools offline?",
    answer:
      "AI model weights and OCR language data need an internet connection the first time they are downloaded. Once cached, processing runs on your device, subject to browser storage and memory.",
  },
];

export function createToolMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    ...createPageMetadata({ title, description, path }),
    robots: { index: true, follow: true },
  };
}

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = new URL(path, siteUrl);
  const image = new URL("/og-image", siteUrl);
  image.searchParams.set("title", title);
  const brandedDescription = description.includes("Zunvox")
    ? description
    : `Zunvox: ${description}`;

  return {
    title: { absolute: title },
    description: brandedDescription,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "Zunvox",
      title,
      description: brandedDescription,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: `${title} — Zunvox` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image, alt: `${title} — Zunvox` }],
    },
  };
}
