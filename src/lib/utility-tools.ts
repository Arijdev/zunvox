import type { ToolId } from "@/lib/processors";

export type UtilityCategory =
  | "Compress"
  | "Convert"
  | "Organize"
  | "AI & Privacy"
  | "Text Tools"
  | "Encode & Convert";

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
    slug: "pdf-rotate",
    title: "PDF Page Rotator",
    description: "Rotate all or selected pages in a PDF by 90, 180, or 270 degrees.",
    category: "Organize",
    processor: "pdf-rotate",
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
  {
    slug: "password-generator",
    title: "Password Generator",
    description: "Generate strong, random passwords with custom options using crypto.getRandomValues.",
    category: "AI & Privacy",
  },
  {
    slug: "word-counter",
    title: "Word Counter & Text Stats",
    description: "Count words, characters, sentences, paragraphs, and estimate reading time.",
    category: "Text Tools",
  },
  {
    slug: "case-converter",
    title: "Text Case Converter",
    description: "Convert text to UPPER, lower, Title, Sentence, camelCase, snake_case, or kebab-case.",
    category: "Text Tools",
  },
  {
    slug: "lorem-ipsum",
    title: "Lorem Ipsum Generator",
    description: "Generate paragraphs of placeholder lorem ipsum text.",
    category: "Text Tools",
  },
  {
    slug: "find-replace",
    title: "Find & Replace",
    description: "Find and replace text within a text area with live preview.",
    category: "Text Tools",
  },
  {
    slug: "line-sorter",
    title: "Line Sorter",
    description: "Sort, reverse, deduplicate, or shuffle lines of text.",
    category: "Text Tools",
  },
  {
    slug: "text-diff",
    title: "Text Diff Viewer",
    description: "Compare two texts and highlight added and removed lines.",
    category: "Text Tools",
  },
  {
    slug: "base64",
    title: "Base64 Encoder / Decoder",
    description: "Encode or decode text to and from Base64 format.",
    category: "Encode & Convert",
  },
  {
    slug: "url-encoder",
    title: "URL Encoder / Decoder",
    description: "Encode or decode URLs and query string parameters.",
    category: "Encode & Convert",
  },
  {
    slug: "html-entities",
    title: "HTML Entity Encoder",
    description: "Encode or decode special HTML characters to their entity equivalents.",
    category: "Encode & Convert",
  },
  {
    slug: "json-formatter",
    title: "JSON Formatter & Validator",
    description: "Prettify, minify, and validate JSON data in your browser.",
    category: "Encode & Convert",
  },
  {
    slug: "number-base",
    title: "Number Base Converter",
    description: "Convert numbers between binary, octal, decimal, and hexadecimal.",
    category: "Encode & Convert",
  },
  {
    slug: "color-converter",
    title: "Color Converter",
    description: "Convert colors between HEX, RGB, and HSL with a live preview.",
    category: "Encode & Convert",
  },
  {
    slug: "hash-generator",
    title: "Hash Generator",
    description: "Generate SHA-256, SHA-1, or SHA-512 hashes of text using the Web Crypto API.",
    category: "Encode & Convert",
  },
  {
    slug: "uuid-generator",
    title: "UUID Generator",
    description: "Generate RFC 4122 v4 UUIDs using crypto.randomUUID.",
    category: "Encode & Convert",
  },
];

export const utilityToolBySlug = new Map(
  utilityTools.map((tool) => [tool.slug, tool]),
);
