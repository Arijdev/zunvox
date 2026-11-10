export type ToolFAQ = { question: string; answer: string };
export type RelatedTool = {
  href: string;
  title: string;
  description: string;
};
export type ToolPageContent = {
  title: string;
  description: string;
  path: string;
  steps: string[];
  features: string[];
  faqs: ToolFAQ[];
  relatedTools: RelatedTool[];
};

const relatedToolSets = {
  imageCompressor: [
    { href: "/tools/pdf-to-word", title: "PDF to Word", description: "Turn selectable PDF text into an editable DOCX." },
    { href: "/tools/ocr", title: "OCR text extractor", description: "Recognize text in images and scanned documents." },
    { href: "/tools/summarize", title: "AI summarizer", description: "Create a concise overview and key takeaways." },
    { href: "/tools/vault", title: "Zunvox Vault", description: "Encrypt files locally with a passphrase you control." },
  ],
  pdfToWord: [
    { href: "/tools/image-compressor", title: "Image compressor", description: "Reduce JPG, PNG, and WebP file sizes." },
    { href: "/tools/ocr", title: "OCR text extractor", description: "Extract text from scanned images and PDFs." },
    { href: "/tools/summarize", title: "AI summarizer", description: "Summarize document text locally in your browser." },
    { href: "/tools/vault", title: "Zunvox Vault", description: "Encrypt files locally with a passphrase you control." },
  ],
  ocr: [
    { href: "/tools/image-compressor", title: "Image compressor", description: "Reduce JPG, PNG, and WebP file sizes." },
    { href: "/tools/pdf-to-word", title: "PDF to Word", description: "Convert selectable PDF text into an editable DOCX." },
    { href: "/tools/summarize", title: "AI summarizer", description: "Create a concise overview and key takeaways." },
    { href: "/tools/vault", title: "Zunvox Vault", description: "Encrypt files locally with a passphrase you control." },
  ],
  summarize: [
    { href: "/tools/image-compressor", title: "Image compressor", description: "Reduce JPG, PNG, and WebP file sizes." },
    { href: "/tools/pdf-to-word", title: "PDF to Word", description: "Convert selectable PDF text into an editable DOCX." },
    { href: "/tools/ocr", title: "OCR text extractor", description: "Recognize text in images and scanned documents." },
    { href: "/tools/vault", title: "Zunvox Vault", description: "Encrypt files locally with a passphrase you control." },
  ],
  vault: [
    { href: "/tools/image-compressor", title: "Image compressor", description: "Reduce JPG, PNG, and WebP file sizes." },
    { href: "/tools/pdf-to-word", title: "PDF to Word", description: "Convert selectable PDF text into an editable DOCX." },
    { href: "/tools/ocr", title: "OCR text extractor", description: "Extract text from scanned images and PDFs." },
    { href: "/tools/summarize", title: "AI summarizer", description: "Summarize document text locally in your browser." },
  ],
} satisfies Record<string, RelatedTool[]>;

export const toolPageContent = {
  imageCompressor: {
    title: "Compress Images Online",
    description:
      "Reduce JPG, PNG, and WebP image file sizes with adjustable quality. Compression runs locally in your browser, so your images stay on your device.",
    path: "/tools/image-compressor",
    steps: [
      "Choose one or more JPG, PNG, or WebP images from your device.",
      "Set the quality slider to balance a smaller file with image detail.",
      "Compress and download the result; batches are delivered in a ZIP file.",
    ],
    features: [
      "Runs on your device; Zunvox does not receive or store your images.",
      "Adjust compression quality before processing and see the resulting file size.",
      "Batch-process multiple images and download them together.",
      "No account, sign-up, or paid API required.",
    ],
    faqs: [
      { question: "Which image formats are supported?", answer: "The compressor accepts JPG, JPEG, PNG, and WebP images." },
      { question: "Are my images uploaded?", answer: "No. Image decoding and compression happen in your browser; files are not uploaded to Zunvox." },
      { question: "Will compression always make my image smaller?", answer: "Not always. PNG and already optimized images may not shrink, and converting image data can change visual quality. Check the output size and quality before using it." },
    ],
    relatedTools: relatedToolSets.imageCompressor,
  },
  pdfToWord: {
    title: "Free PDF to Word Converter",
    description:
      "Convert selectable text in a PDF into an editable Word document in your browser. The conversion is private and free; complex page layout, images, and scanned text are not preserved.",
    path: "/tools/pdf-to-word",
    steps: [
      "Select a text-based PDF from your device (scanned image-only PDFs need OCR first).",
      "Convert the selectable PDF text into a new DOCX document.",
      "Download the DOCX and review its text in your word processor.",
    ],
    features: [
      "PDF text extraction and DOCX creation run locally in your browser.",
      "No server upload, login, or paid conversion service is involved.",
      "Creates editable paragraphs from selectable text.",
      "Clearly reports when a PDF has no selectable text instead of producing an empty document.",
    ],
    faqs: [
      { question: "Does the converter preserve PDF formatting?", answer: "No. It extracts selectable text and creates a DOCX with editable paragraphs; original columns, fonts, images, tables, and page layout are not retained." },
      { question: "Can I convert a scanned PDF?", answer: "Scanned image-only PDFs do not contain selectable text. Run the OCR text extractor first; OCR output can then be copied into a Word document." },
      { question: "Is there a file upload?", answer: "No. PDF parsing and DOCX generation happen in your browser. The file is not sent to Zunvox." },
    ],
    relatedTools: relatedToolSets.pdfToWord,
  },
  ocr: {
    title: "Free Online OCR Text Extractor",
    description:
      "Extract editable text from images and scanned PDF documents with local browser OCR. English recognition data is downloaded by Tesseract.js and used on your device.",
    path: "/tools/ocr",
    steps: [
      "Choose an image or PDF containing clear, readable text.",
      "Wait for the local OCR engine and English recognition data to load if this is your first use.",
      "Review the recognized text, copy it, or move it into the summarizer.",
    ],
    features: [
      "Recognizes text locally with Tesseract.js; the document itself is not uploaded.",
      "Accepts common image formats and scanned PDF documents.",
      "Provides editable extracted text with copy and summarize actions.",
      "Shows local processing and model download progress.",
    ],
    faqs: [
      { question: "Which files can I process with OCR?", answer: "The OCR tool supports PNG, JPG, JPEG, WebP, and PDF files up to 30 MB." },
      { question: "Does OCR work with handwriting?", answer: "Recognition is designed primarily for clear printed text. Handwriting, low contrast, skew, and unusual fonts can reduce accuracy." },
      { question: "Is OCR processing private?", answer: "The document is processed in your browser. Tesseract.js may download its OCR code and English language data on first use, but your document is not uploaded." },
    ],
    relatedTools: relatedToolSets.ocr,
  },
  summarize: {
    title: "Free AI Document Summarizer",
    description:
      "Summarize document text, articles, and reports with a local AI model. Model inference runs in a browser worker; your text is not uploaded to a cloud AI service.",
    path: "/tools/summarize",
    steps: [
      "Paste text or load a TXT or text-based PDF document.",
      "Start the summary and wait while the local model loads or runs on your device.",
      "Review the overview and key takeaways, then copy the result.",
    ],
    features: [
      "Local text inference runs in a Web Worker to keep the interface responsive.",
      "No account or paid external AI API is required.",
      "First-use model weights are cached locally by the browser where available.",
      "Supports pasted text and local TXT or text-based PDF extraction.",
    ],
    faqs: [
      { question: "Is my document sent to an AI server?", answer: "No. Text processing runs with a model in your browser worker. Model files may download from their hosting provider on first use, but your document text is not uploaded." },
      { question: "Can it summarize a scanned PDF?", answer: "The summarizer reads selectable PDF text. For an image-only scan, use the OCR extractor first and then paste or move the recognized text to the summarizer." },
      { question: "Why does the first summary take longer?", answer: "The browser may need to download the model weights the first time. The weights can be cached locally for later visits, subject to your browser's storage settings." },
    ],
    relatedTools: relatedToolSets.summarize,
  },
  vault: {
    title: "Zunvox Vault: Private File Encryption",
    description:
      "Encrypt files with AES-256-GCM in your browser using a passphrase only you know. Zunvox never receives your file, password, or encryption key.",
    path: "/tools/vault",
    steps: [
      "Choose Lock Document and select a file, then create a strong passphrase of at least 12 characters.",
      "Encrypt the file locally and download its .Zunvox container. The original filename and file type are encrypted too.",
      "To restore it later, choose Unlock Document, select the .Zunvox file, and enter the exact same passphrase.",
    ],
    features: [
      "AES-256-GCM authenticated encryption with a random salt and unique per-file nonce sequence.",
      "PBKDF2-SHA-256 derives the non-exportable encryption key from your passphrase.",
      "Files are read and processed in 256 KB chunks instead of loading the entire source into a JavaScript buffer.",
      "No account, server upload, or password recovery service: only your passphrase can unlock your file.",
    ],
    faqs: [
      { question: "Can Zunvox recover a forgotten passphrase?", answer: "No. The passphrase is never sent or stored. If you lose it, the encrypted file cannot be recovered, so keep a secure backup of your passphrase." },
      { question: "Are the original filename and file type visible in the encrypted file?", answer: "No. The original filename, MIME type, and size are stored inside authenticated encrypted metadata." },
      { question: "Does the vault upload files or keys?", answer: "No. Key derivation and file encryption/decryption use the browser Web Crypto API. The only output is a file downloaded to your device." },
      { question: "Can I encrypt very large files?", answer: "The vault processes files in 256 KB chunks and supports files up to 1 GB. The browser still needs storage/memory for the final downloadable Blob, so available device memory can limit the practical size." },
    ],
    relatedTools: relatedToolSets.vault,
  },
} satisfies Record<string, ToolPageContent>;
