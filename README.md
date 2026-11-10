# Zunvox

Zunvox is a privacy-focused collection of file utilities built with Next.js, React, TypeScript, and Tailwind CSS. Its file tools process documents in the browser so that files do not need to be uploaded to a Zunvox file-processing service.

The site includes image and document utilities, OCR, on-device AI features, and a client-side encrypted file vault. It is designed for modern browsers; processing speed and supported file sizes depend on the browser and device.

**Live deployment:** [https://zunvox.vercel.app/](https://zunvox.vercel.app/)

## Features

### File utilities

Each tool has its own page and workspace:

| Category | Tools |
| --- | --- |
| Compress | `/tools/image-compressor`, `/tools/pdf-compressor`, `/tools/word-compressor` |
| Convert | `/tools/image-to-pdf`, `/tools/pdf-to-word`, `/tools/document-converters`, `/tools/image-converter`, `/tools/pdf-to-images` |
| Organize | `/tools/image-resizer`, `/tools/pdf-crop`, `/tools/pdf-merge`, `/tools/pdf-split` |
| AI & privacy | `/tools/ocr`, `/tools/summarize`, `/tools/vault` |

The home page (`/`) is a dashboard linking to the individual tools. `/about`, `/privacy`, and `/feedback` are separate informational pages.

### Privacy and local AI

- File operations run in the browser; selected documents and processed results are not uploaded to Zunvox for processing.
- OCR and AI features may download their code, language data, or model weights from third-party asset hosts on first use. These downloads require an internet connection and may be cached by the browser. The documents and text being processed stay on the device.
- AI inference runs in a web worker. Model assets are cached in browser storage when available.
- Feedback is not submitted to a server. The feedback page copies the message to the clipboard so the user can share it through a channel they choose.

### Zunvox Vault

Vault uses the browser Web Crypto API with AES-GCM and PBKDF2-SHA-256 (600,000 iterations) to encrypt and decrypt files locally. New vault files use the `.zunvox` extension; existing `.kurox` vault files remain supported. Vault files contain encrypted file metadata and encrypted file contents.

Keep the passphrase safe: it cannot be recovered if lost. Vault supports files up to 1 GiB, subject to browser and device limits. Processing is chunked, but the browser still holds the final downloadable `Blob`; JavaScript cannot guarantee secure erasure of every browser-managed copy from memory.

## Requirements

- Node.js 20.9 or later
- npm
- A modern browser for using the tools; HTTPS or localhost is required for Web Crypto features

Node.js 22 LTS is recommended for deployment.

## Run locally

```bash
git clone <repository-url> Zunvox
cd Zunvox
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build (run `npm run build` first) |

## Configuration

Zunvox uses `https://zunvox.vercel.app` as its default canonical origin for page metadata, sitemap entries, robots metadata, and structured data. For a different canonical domain, set `NEXT_PUBLIC_SITE_URL` to its HTTPS origin:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

The application does not require a file-processing API or server-side file upload endpoint.

## Deploy

Zunvox is a standard Next.js application and can be deployed to Vercel or another host that supports the Next.js Node.js server.

### Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket and import it into Vercel.
2. Keep the framework preset set to **Next.js**. Vercel detects the build and output settings automatically.
3. Set `NEXT_PUBLIC_SITE_URL` in the project’s environment variables to the canonical HTTPS origin (currently `https://zunvox.vercel.app`). Apply it to Production and Preview environments as appropriate. For a custom production domain, add the domain to Vercel and use that exact origin.
4. Deploy. Vercel builds the project with `npm run build`; redeploy after changing environment variables.

No secrets or API keys are required for the current client-side features. Do not add private credentials to `NEXT_PUBLIC_*` variables.

### Other Node.js hosts

Use Node.js 20.9 or newer (Node.js 22 LTS recommended) and npm:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run start
```

Configure `NEXT_PUBLIC_SITE_URL` in the host’s environment before building. Keep the generated `.next` directory and the `public` directory available to the running Next.js server. Do not deploy this application as a static export unless its server-rendered and generated routes are intentionally adapted for that hosting model.

### Before release

- Confirm the deployment domain uses HTTPS and `NEXT_PUBLIC_SITE_URL` matches it exactly.
- Run lint, type checking, and a production build.
- Smoke-test the home page, informational pages, tool routes, `/robots.txt`, and `/sitemap.xml` on the deployed site.
- Exercise file processing and Vault in a current browser; HTTPS is required for Web Crypto outside localhost.
- Test AI/OCR on first use with network access. Those features fetch model or language assets from external providers, so a first run may not be offline.
- Check the deployed page’s canonical URL and ensure the sitemap uses the production hostname.

## Tool capabilities and limitations

- **Images:** Compress, convert between JPG/PNG/WebP, resize, crop, and combine JPG/PNG images into a PDF. Batch image outputs are packaged as a ZIP. Lossy output formats can increase or reduce file size depending on source and settings.
- **PDFs:** Repack PDFs and remove document metadata, merge PDFs in the selected order, extract selected page ranges, set a crop box, export pages as JPG/PNG, and extract selectable text.
- **Documents:** Convert supported text-based files (TXT, RTF, and DOCX) and create DOCX files from text. PDF-to-Word extracts selectable text into a DOCX; it does not preserve complex page layout, images, or scanned pages.
- **OCR:** Extract text from images and scanned PDFs using Tesseract.js in the browser. Recognition quality depends on scan quality and the available language data.
- **AI:** Summarize text and proofread English text locally with Transformers.js models. First-time model downloads can be large and require available browser storage and device memory.
- **Compression limitations:** The PDF compressor does not re-encode embedded images. DOCX compression recompresses the package and does not remove embedded assets. These operations may not make every file smaller.

Legacy binary `.doc` files are not supported. Very large documents, images, or AI models can exceed the memory or storage limits of a device or browser.

## Install Zunvox

Zunvox can be installed as a Progressive Web App (PWA), not as a separate Electron `.exe`, Android `.apk`, or iOS `.ipa` package. Open `/about` on the device where you want to install it:

- **Windows:** Open Zunvox in Microsoft Edge or Google Chrome, select the install icon in the address bar or use the browser menu, then confirm **Install Zunvox**. Where supported, the About page can open the browser's native install prompt.
- **Android:** Open Zunvox in Chrome and choose **Install app** or **Add to Home screen** from the browser menu. The About page can open the native install prompt when Chrome exposes it.
- **iPhone or iPad:** Open Zunvox in Safari, tap **Share**, choose **Add to Home Screen**, then confirm.

The install adds the web app to the device's app launcher or home screen. File operations run locally in the browser. AI and OCR still need to fetch their model or language assets before those features can be used offline.

## SEO and routes

Tool pages have route-specific metadata and canonical URLs. The app also generates `sitemap.xml` and `robots.txt`. Set `NEXT_PUBLIC_SITE_URL` correctly before deploying so those URLs point at the production domain.

## Technology

- Next.js App Router, React, and TypeScript
- Tailwind CSS
- `pdf-lib` and `pdfjs-dist` for PDF operations
- `jszip` for archive and document packaging
- `@huggingface/transformers` for local AI inference
- `tesseract.js` for browser-based OCR
- Web Crypto API for Zunvox Vault
