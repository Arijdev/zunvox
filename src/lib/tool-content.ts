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
  general: [
    { href: "/tools/image-compressor", title: "Image compressor", description: "Reduce JPG, PNG, and WebP file sizes." },
    { href: "/tools/pdf-to-word", title: "PDF to Word", description: "Convert selectable PDF text into an editable DOCX." },
    { href: "/tools/pdf-rotate", title: "PDF rotator", description: "Rotate PDF pages clockwise or counter-clockwise." },
    { href: "/tools/word-counter", title: "Word counter", description: "Count words, characters, and reading time." },
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
  pdfRotate: {
    title: "Rotate PDF Pages Online",
    description: "Rotate all or selected pages in a PDF document by 90, 180, or 270 degrees. Processing runs entirely in your browser.",
    path: "/tools/pdf-rotate",
    steps: [
      "Select a PDF file from your device.",
      "Choose the rotation angle (90° clockwise, 180°, or 270°) and specify which pages to rotate.",
      "Download the rotated PDF document.",
    ],
    features: [
      "100% client-side: your PDF is never uploaded to any server.",
      "Rotate all pages or custom ranges (e.g., 1, 3-5).",
      "Fast, lossless page rotation preserving text and vector content.",
      "Completely free with no sign-up or watermark.",
    ],
    faqs: [
      { question: "Does rotating affect PDF quality?", answer: "No. Page rotation modifies the PDF display orientation metadata without re-encoding, preserving full document quality." },
      { question: "Can I rotate only specific pages?", answer: "Yes. You can specify single pages or ranges like '1, 3-5' or rotate all pages at once." },
    ],
    relatedTools: relatedToolSets.general,
  },
  passwordGenerator: {
    title: "Strong Password Generator",
    description: "Generate cryptographically secure, random passwords directly on your device using the browser Web Crypto API.",
    path: "/tools/password-generator",
    steps: [
      "Select the desired password length and character sets (uppercase, lowercase, numbers, symbols).",
      "Optionally exclude ambiguous characters such as 0, O, 1, and l.",
      "Click Generate and copy your secure password to clipboard.",
    ],
    features: [
      "Uses window.crypto.getRandomValues for true cryptographic randomness.",
      "Real-time password strength meter and entropy evaluation.",
      "Option to generate multiple passwords at once.",
      "No passwords are ever logged, transmitted, or saved.",
    ],
    faqs: [
      { question: "How secure are the generated passwords?", answer: "Passwords are generated using the browser's cryptographic pseudo-random number generator (CSPRNG), making them unpredictable and secure against brute-force attacks." },
    ],
    relatedTools: relatedToolSets.general,
  },
  wordCounter: {
    title: "Word Counter & Text Statistics",
    description: "Real-time word count, character count, sentence count, paragraph count, and reading time estimation.",
    path: "/tools/word-counter",
    steps: [
      "Type or paste your text into the input box.",
      "Review the live statistics updated automatically as you type.",
      "Copy or clear the text with a single click.",
    ],
    features: [
      "Live counter updating on every keystroke.",
      "Detailed breakdown: words, characters (with and without spaces), sentences, and paragraphs.",
      "Estimated reading time based on standard reading speed.",
      "Private and instant: no text is sent over the network.",
    ],
    faqs: [
      { question: "Is there a limit on text length?", answer: "No practical limit. The tool processes millions of characters directly in your browser without lag." },
    ],
    relatedTools: relatedToolSets.general,
  },
  caseConverter: {
    title: "Text Case Converter",
    description: "Convert text instantly between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case.",
    path: "/tools/case-converter",
    steps: [
      "Paste or type text into the input area.",
      "Click your desired case format button.",
      "Copy the converted text to your clipboard.",
    ],
    features: [
      "Supports 8+ casing styles including programming conventions (camelCase, snake_case, kebab-case).",
      "One-click copy to clipboard.",
      "Completely private client-side execution.",
    ],
    faqs: [
      { question: "What casing formats are supported?", answer: "UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case, and PascalCase." },
    ],
    relatedTools: relatedToolSets.general,
  },
  loremIpsum: {
    title: "Lorem Ipsum Placeholder Generator",
    description: "Generate customized placeholder text and paragraphs for design, development, and layout mocking.",
    path: "/tools/lorem-ipsum",
    steps: [
      "Choose the number of paragraphs you need.",
      "Adjust words per paragraph or starting phrase.",
      "Generate and copy the placeholder text.",
    ],
    features: [
      "Clean, standard Latin placeholder text.",
      "Customizable paragraph count and length.",
      "Instant one-click copy to clipboard.",
    ],
    faqs: [
      { question: "What is Lorem Ipsum?", answer: "Lorem Ipsum is standard placeholder dummy text used in printing and typesetting since the 1500s." },
    ],
    relatedTools: relatedToolSets.general,
  },
  findReplace: {
    title: "Text Find & Replace Tool",
    description: "Search and replace words or phrases in any text with case-sensitive and match-count options.",
    path: "/tools/find-replace",
    steps: [
      "Paste your text into the editor.",
      "Enter the text to find and the replacement text.",
      "Click Replace to see live highlights and copy the updated text.",
    ],
    features: [
      "Case-sensitive and case-insensitive matching options.",
      "Highlights all match occurrences.",
      "Instant client-side replacement.",
    ],
    faqs: [
      { question: "Does it support case sensitivity?", answer: "Yes, you can toggle case sensitivity on or off." },
    ],
    relatedTools: relatedToolSets.general,
  },
  lineSorter: {
    title: "Line Sorter & Deduplicator",
    description: "Sort lines alphabetically, in reverse, deduplicate repeated lines, or randomize line order.",
    path: "/tools/line-sorter",
    steps: [
      "Paste a list of lines into the workspace.",
      "Choose an action: Sort A-Z, Sort Z-A, Reverse, Deduplicate, or Shuffle.",
      "Copy the cleaned list.",
    ],
    features: [
      "Alphabetical and reverse sorting.",
      "Instant duplicate line removal.",
      "Random shuffle and reverse line order.",
    ],
    faqs: [
      { question: "Can I remove duplicates while sorting?", answer: "Yes, you can deduplicate lines and then sort them in one click." },
    ],
    relatedTools: relatedToolSets.general,
  },
  textDiff: {
    title: "Text Diff & Comparison Viewer",
    description: "Compare two pieces of text and clearly highlight added, removed, and modified lines.",
    path: "/tools/text-diff",
    steps: [
      "Paste the original text in the left box.",
      "Paste the modified text in the right box.",
      "Review the color-coded line-by-line differences.",
    ],
    features: [
      "Side-by-side or unified line-by-line diff.",
      "Green highlighting for additions, red highlighting for removals.",
      "Fast, client-side diff algorithm with zero server calls.",
    ],
    faqs: [
      { question: "Is my text uploaded for comparison?", answer: "No. The diff algorithm runs entirely in JavaScript on your device." },
    ],
    relatedTools: relatedToolSets.general,
  },
  base64: {
    title: "Base64 Encoder & Decoder",
    description: "Encode text to Base64 or decode Base64 strings back to readable UTF-8 text.",
    path: "/tools/base64",
    steps: [
      "Enter or paste text into the input field.",
      "Click Encode to convert to Base64, or Decode to convert from Base64.",
      "Copy the resulting output.",
    ],
    features: [
      "Full UTF-8 support for unicode characters and emojis.",
      "Helpful error validation for malformed Base64 inputs.",
      "Instant client-side encoding and decoding.",
    ],
    faqs: [
      { question: "Does it support UTF-8 characters?", answer: "Yes, non-ASCII and international characters are properly handled using UTF-8 byte encoding." },
    ],
    relatedTools: relatedToolSets.general,
  },
  urlEncoder: {
    title: "URL Encoder & Decoder",
    description: "Encode characters for safe URL transmission or decode percent-encoded URLs.",
    path: "/tools/url-encoder",
    steps: [
      "Paste a URL or query string into the input box.",
      "Choose Encode to percent-encode special characters, or Decode to restore readable text.",
      "Copy the result.",
    ],
    features: [
      "Encodes spaces, symbols, and query parameters.",
      "Decodes %20, %2F, and other percent-encoded sequences.",
      "One-click copy to clipboard.",
    ],
    faqs: [
      { question: "When should I encode a URL?", answer: "URLs must be percent-encoded when passing parameters that contain spaces, slashes, ampersands, or non-ASCII characters." },
    ],
    relatedTools: relatedToolSets.general,
  },
  htmlEntities: {
    title: "HTML Entity Encoder & Decoder",
    description: "Convert special HTML characters like <, >, &, and quotes into safe HTML entities, or decode them back.",
    path: "/tools/html-entities",
    steps: [
      "Paste your HTML or text into the editor.",
      "Click Encode to convert symbols to &lt;, &gt;, etc., or Decode to reverse.",
      "Copy the escaped or unescaped text.",
    ],
    features: [
      "Protects against XSS and display issues when embedding code.",
      "Supports named and numeric character entities.",
      "Fast in-browser processing.",
    ],
    faqs: [
      { question: "Which characters are escaped?", answer: "Characters like <, >, &, \", and ' are converted to &lt;, &gt;, &amp;, &quot;, and &#39;." },
    ],
    relatedTools: relatedToolSets.general,
  },
  jsonFormatter: {
    title: "JSON Formatter & Validator",
    description: "Prettify, minify, and validate JSON data with clear syntax error reporting.",
    path: "/tools/json-formatter",
    steps: [
      "Paste JSON code into the workspace.",
      "Click Prettify to format with indentation, or Minify to compact into one line.",
      "Check syntax validation and copy the formatted JSON.",
    ],
    features: [
      "Custom 2-space indentation formatting.",
      "Minification removing unnecessary whitespace.",
      "Clear syntax error messages with line and character indications.",
    ],
    faqs: [
      { question: "Is my JSON validated?", answer: "Yes, invalid JSON triggers an informative error message explaining the syntax issue." },
    ],
    relatedTools: relatedToolSets.general,
  },
  numberBase: {
    title: "Number Base Converter",
    description: "Convert numbers simultaneously across Binary (Base 2), Octal (Base 8), Decimal (Base 10), and Hexadecimal (Base 16).",
    path: "/tools/number-base",
    steps: [
      "Select your input base (Binary, Octal, Decimal, or Hex).",
      "Type in the number value.",
      "View live conversions in all other bases simultaneously.",
    ],
    features: [
      "Simultaneous conversion across all 4 major bases.",
      "Support for large numbers and prefix formatting (0b, 0x).",
      "One-click copy for each converted base.",
    ],
    faqs: [
      { question: "Which bases are supported?", answer: "Binary (base 2), Octal (base 8), Decimal (base 10), and Hexadecimal (base 16)." },
    ],
    relatedTools: relatedToolSets.general,
  },
  colorConverter: {
    title: "Color Converter & Color Picker",
    description: "Convert color codes between HEX, RGB, and HSL formats with an interactive live color preview.",
    path: "/tools/color-converter",
    steps: [
      "Pick a color with the color picker or type a HEX, RGB, or HSL code.",
      "View synchronized values across all formats.",
      "Copy any format code with one click.",
    ],
    features: [
      "Real-time bidirectional color conversion.",
      "Interactive color swatch preview.",
      "Outputs clean CSS-ready codes.",
    ],
    faqs: [
      { question: "Can I input RGB or HSL directly?", answer: "Yes, you can edit any color field and the others will sync automatically." },
    ],
    relatedTools: relatedToolSets.general,
  },
  hashGenerator: {
    title: "Hash Generator (SHA-256, SHA-1, SHA-512)",
    description: "Generate cryptographic hashes of text locally in your browser using the Web Crypto API.",
    path: "/tools/hash-generator",
    steps: [
      "Enter text into the input field.",
      "Choose the hash algorithm (SHA-256, SHA-1, or SHA-512).",
      "Generate and copy the resulting hex checksum.",
    ],
    features: [
      "Powered by the browser's native crypto.subtle.digest.",
      "Zero network latency and 100% privacy.",
      "Generates standard 64-character (SHA-256), 40-character (SHA-1), or 128-character (SHA-512) hashes.",
    ],
    faqs: [
      { question: "Are my inputs uploaded to generate hashes?", answer: "No. Hashes are computed entirely locally on your device via Web Crypto." },
    ],
    relatedTools: relatedToolSets.general,
  },
  uuidGenerator: {
    title: "UUID / GUID Generator",
    description: "Generate cryptographically random UUID v4 identifiers using the browser Web Crypto API.",
    path: "/tools/uuid-generator",
    steps: [
      "Select how many UUIDs you want to generate (1 to 20).",
      "Click Generate UUIDs.",
      "Copy individual UUIDs or copy all at once.",
    ],
    features: [
      "Compliant with RFC 4122 version 4 UUID specifications.",
      "Generated using crypto.randomUUID for cryptographic uniqueness.",
      "Bulk generation with copy-all capability.",
    ],
    faqs: [
      { question: "Are these UUIDs unique?", answer: "Yes, v4 UUIDs have 122 bits of cryptographic randomness, making collisions virtually impossible." },
    ],
    relatedTools: relatedToolSets.general,
  },
} satisfies Record<string, ToolPageContent>;
