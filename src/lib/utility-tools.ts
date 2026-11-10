import type { ToolId } from "@/lib/processors";

export type UtilityCategory = "Compress" | "Convert" | "Organize" | "AI & Privacy";

export type UtilityTool = {
  slug: string;
  title: string;
  description: string;
  category: UtilityCategory;
  processor?: ToolId;
};

export const utilityTools: UtilityTool[] = [
  {
    slug: "image-compressor",
    title: "Image Compressor",
    description: "Reduce JPG, PNG, and WebP image sizes with adjustable quality.",
    category: "Compress",
    processor: "image-compress",
  },
  {
    slug: "pdf-compressor",
    title: "PDF Compressor",
    description: "Repack a PDF and remove document metadata locally.",
    category: "Compress",
    processor: "pdf-compress",
  },
  {
    slug: "word-compressor",
    title: "Word Compressor",
    description: "Recompress a DOCX package without removing its contents.",
    category: "Compress",
    processor: "document-compress",
  },
  {
    slug: "image-to-pdf",
    title: "Image to PDF",
    description: "Combine JPG and PNG images into a single PDF.",
    category: "Convert",
    processor: "images-to-pdf",
  },
  {
    slug: "pdf-to-word",
    title: "PDF to Word",
    description: "Convert selectable PDF text into an editable DOCX.",
    category: "Convert",
    processor: "document-convert",
  },
  {
    slug: "document-converters",
    title: "Document Converters",
    description: "Convert text-based PDF, TXT, RTF, and DOCX documents.",
    category: "Convert",
    processor: "document-convert",
  },
  {
    slug: "image-converter",
    title: "Image Converter",
    description: "Convert images between JPG, PNG, and WebP formats.",
    category: "Convert",
    processor: "image-convert",
  },
  {
    slug: "pdf-to-images",
    title: "PDF to Images",
    description: "Export PDF pages as individual JPG or PNG images.",
    category: "Convert",
    processor: "pdf-to-images",
  },
  {
    slug: "image-resizer",
    title: "Image Resizer",
    description: "Resize images to fit your preferred dimensions.",
    category: "Organize",
    processor: "image-resize",
  },
  {
    slug: "pdf-crop",
    title: "PDF Page Crop",
    description: "Set a custom crop box for every page in a PDF.",
    category: "Organize",
    processor: "pdf-crop",
  },
  {
    slug: "pdf-merge",
    title: "PDF Merger",
    description: "Combine PDF files in the order you select.",
    category: "Organize",
    processor: "pdf-merge",
  },
  {
    slug: "pdf-split",
    title: "PDF Splitter",
    description: "Extract selected page ranges into separate PDF files.",
    category: "Organize",
    processor: "pdf-split",
  },
  {
    slug: "ocr",
    title: "OCR Text Extractor",
    description: "Recognize text in images and scanned PDF documents.",
    category: "AI & Privacy",
  },
  {
    slug: "summarize",
    title: "AI Summarizer",
    description: "Create a concise overview and key takeaways on-device.",
    category: "AI & Privacy",
  },
  {
    slug: "vault",
    title: "Zunvox Vault",
    description: "Encrypt and decrypt files locally with your passphrase.",
    category: "AI & Privacy",
  },
];

export const utilityToolBySlug = new Map(
  utilityTools.map((tool) => [tool.slug, tool]),
);
