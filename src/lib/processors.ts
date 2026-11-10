import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type ToolId =
  | "image-compress"
  | "image-convert"
  | "image-resize"
  | "pdf-crop"
  | "images-to-pdf"
  | "pdf-compress"
  | "pdf-merge"
  | "pdf-split"
  | "pdf-to-images"
  | "document-convert"
  | "document-compress";

export type ProcessingOptions = {
  quality: number;
  imageFormat: "auto" | "image/jpeg" | "image/png" | "image/webp";
  maxWidth: number;
  maxHeight: number;
  cropEnabled: boolean;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  pageRanges: string;
  documentFormat: "auto" | "txt" | "docx" | "pdf";
};

export type ProcessingResult = {
  blob: Blob;
  filename: string;
  originalSize: number;
  details: string;
};

const extensionOf = (name: string) =>
  name.split(".").pop()?.toLowerCase() ?? "";

const baseName = (name: string) => name.replace(/\.[^.]+$/, "");

const safeName = (name: string) => name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

function pdfBlob(bytes: Uint8Array) {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new Blob([buffer], { type: "application/pdf" });
}

function getImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} could not be opened as an image.`));
    };
    image.src = url;
  });
}

function canvasBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Your browser could not create the converted image.")),
      mimeType,
      quality,
    );
  });
}

function imageExtension(mimeType: string) {
  return mimeType === "image/jpeg"
    ? "jpg"
    : mimeType === "image/webp"
      ? "webp"
      : "png";
}

function saveName(name: string, extension: string) {
  return `${safeName(baseName(name))}.${extension}`;
}

async function processImages(
  tool: ToolId,
  files: File[],
  options: ProcessingOptions,
  onProgress: (progress: number) => void,
): Promise<ProcessingResult> {
  const zip = new JSZip();
  const outputFiles: { name: string; blob: Blob }[] = [];

  for (const [index, file] of files.entries()) {
    const image = await getImage(file);
    const canvas = document.createElement("canvas");
    const sourceX = options.cropEnabled ? Math.max(0, Math.floor(options.cropX)) : 0;
    const sourceY = options.cropEnabled ? Math.max(0, Math.floor(options.cropY)) : 0;
    const sourceWidth = options.cropEnabled
      ? Math.min(
          Math.floor(options.cropWidth),
          image.naturalWidth - sourceX,
        )
      : image.naturalWidth;
    const sourceHeight = options.cropEnabled
      ? Math.min(
          Math.floor(options.cropHeight),
          image.naturalHeight - sourceY,
        )
      : image.naturalHeight;
    if (sourceWidth < 1 || sourceHeight < 1) {
      throw new Error(
        `The crop area for ${file.name} is outside the image or has no size.`,
      );
    }
    const scale =
      tool === "image-resize"
        ? Math.min(
            1,
            Math.max(1, options.maxWidth) / sourceWidth,
            Math.max(1, options.maxHeight) / sourceHeight,
          )
        : 1;
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare the image canvas.");
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const mimeType =
      (tool === "image-convert" || tool === "image-resize") &&
      options.imageFormat !== "auto"
        ? options.imageFormat
        : tool === "image-compress" && options.imageFormat !== "auto"
          ? options.imageFormat
          : file.type === "image/png"
            ? tool === "image-compress"
              ? "image/webp"
              : "image/png"
            : file.type === "image/webp"
              ? "image/webp"
              : "image/jpeg";
    if (mimeType === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    const blob = await canvasBlob(canvas, mimeType, options.quality / 100);
    outputFiles.push({
      name: saveName(file.name, imageExtension(mimeType)),
      blob,
    });
    onProgress(Math.round(((index + 1) / files.length) * 90));
  }

  const originalSize = files.reduce((total, file) => total + file.size, 0);
  if (outputFiles.length === 1) {
    return {
      blob: outputFiles[0].blob,
      filename: outputFiles[0].name,
      originalSize,
      details: `${formatBytes(outputFiles[0].blob.size)} output`,
    };
  }

  outputFiles.forEach(({ name, blob }) => zip.file(name, blob));
  return {
    blob: await zip.generateAsync({ type: "blob", compression: "DEFLATE" }),
    filename: "zunvox-images.zip",
    originalSize,
    details: `${outputFiles.length} images packed into a ZIP`,
  };
}

function parsePageRanges(input: string, pageCount: number) {
  const ranges = input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (ranges.length === 0) throw new Error("Enter at least one page or page range.");

  return ranges.map((range) => {
    const match = range.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) {
      throw new Error('Use page numbers like "1, 3-5, 8".');
    }
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < start || end > pageCount) {
      throw new Error(`Page range "${range}" is outside this ${pageCount}-page PDF.`);
    }
    return Array.from({ length: end - start + 1 }, (_, index) => start - 1 + index);
  });
}

async function createPdfFromText(text: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const lines = text.split(/\r?\n/).flatMap((line) => {
    if (!line) return [""];
    const wrapped: string[] = [];
    for (let index = 0; index < line.length; index += 90) {
      wrapped.push(line.slice(index, index + 90));
    }
    return wrapped;
  });

  for (let index = 0; index < lines.length; index += 54) {
    const page = pdf.addPage([612, 792]);
    page.drawText(lines.slice(index, index + 54).join("\n"), {
      x: 48,
      y: 744,
      size: 10,
      lineHeight: 13,
      font,
      color: rgb(0.12, 0.16, 0.22),
      maxWidth: 516,
    });
  }
  if (lines.length === 0) pdf.addPage([612, 792]);
  return pdfBlob(await pdf.save());
}

function escapeXml(text: string) {
  return text.replace(/[<>&'"]/g, (character) => {
    const replacements: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return replacements[character];
  });
}

export async function textToDocx(text: string) {
  const zip = new JSZip();
  const paragraphs = text
    .split(/\r?\n/)
    .map(
      (line) =>
        `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`,
    )
    .join("");

  zip.file(
    "[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      "</Types>",
  );
  zip.file(
    "_rels/.rels",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      "</Relationships>",
  );
  zip.file(
    "word/document.xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      `<w:body>${paragraphs}<w:sectPr/></w:body></w:document>`,
  );
  return zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });
}

async function documentText(file: File) {
  const extension = extensionOf(file.name);
  const source = await file.text();
  if (extension === "txt") return source;
  if (extension === "rtf") {
    return source
      .replace(/\\'([0-9a-f]{2})/gi, (_, hex: string) =>
        String.fromCharCode(parseInt(hex, 16)),
      )
      .replace(/\\par[d]?/g, "\n")
      .replace(/\\tab/g, "\t")
      .replace(/\\[a-z]+-?\d* ?/gi, "")
      .replace(/[{}]/g, "");
  }
  if (extension === "docx") {
    const zip = await JSZip.loadAsync(file);
    const document = zip.file("word/document.xml");
    if (!document) throw new Error("This DOCX file is missing its document content.");
    const xml = new DOMParser().parseFromString(
      await document.async("text"),
      "application/xml",
    );
    if (xml.querySelector("parsererror")) {
      throw new Error("This DOCX file contains invalid document XML.");
    }
    return Array.from(xml.getElementsByTagName("w:p"))
      .map((paragraph) =>
        Array.from(paragraph.getElementsByTagName("w:t"))
          .map((part) => part.textContent ?? "")
          .join(""),
      )
      .join("\n");
  }
  throw new Error(
    "Legacy .doc files are not supported. Save the document as .docx or .rtf and try again.",
  );
}

async function pdfText(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
  try {
    const document = await loadingTask.promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" "),
      );
    }
    return pages.join("\n\n");
  } finally {
    await loadingTask.destroy();
  }
}

async function pdfToImages(
  file: File,
  format: "image/jpeg" | "image/png",
  onProgress: (progress: number) => void,
) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
  try {
    const document = await loadingTask.promise;
    const zip = new JSZip();
    const extension = format === "image/jpeg" ? "jpg" : "png";

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = window.document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare the PDF preview.");
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const blob = await canvasBlob(canvas, format, 0.9);
      zip.file(`${safeName(baseName(file.name))}-page-${pageNumber}.${extension}`, blob);
      onProgress(Math.round((pageNumber / document.numPages) * 90));
    }
    return await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  } finally {
    await loadingTask.destroy();
  }
}

export async function processFiles(
  tool: ToolId,
  files: File[],
  options: ProcessingOptions,
  onProgress: (progress: number) => void,
): Promise<ProcessingResult> {
  if (tool.startsWith("image-")) {
    return processImages(tool, files, options, onProgress);
  }

  const originalSize = files.reduce((total, file) => total + file.size, 0);

  if (tool === "images-to-pdf") {
    const pdf = await PDFDocument.create();
    for (const [index, file] of files.entries()) {
      const bytes = await file.arrayBuffer();
      const image =
        file.type === "image/png"
          ? await pdf.embedPng(bytes)
          : await pdf.embedJpg(bytes);
      const page = pdf.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
      onProgress(Math.round(((index + 1) / files.length) * 90));
    }
    return {
      blob: pdfBlob(await pdf.save()),
      filename: "images-to-pdf.pdf",
      originalSize,
      details: `${files.length} images combined into one PDF`,
    };
  }

  if (tool === "pdf-merge") {
    const merged = await PDFDocument.create();
    for (const [index, file] of files.entries()) {
      const source = await PDFDocument.load(await file.arrayBuffer());
      const pages = await merged.copyPages(source, source.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
      onProgress(Math.round(((index + 1) / files.length) * 90));
    }
    return {
      blob: pdfBlob(await merged.save()),
      filename: "merged-document.pdf",
      originalSize,
      details: `${merged.getPageCount()} pages merged`,
    };
  }

  if (tool === "pdf-split") {
    const source = await PDFDocument.load(await files[0].arrayBuffer());
    const ranges = parsePageRanges(options.pageRanges, source.getPageCount());
    const zip = new JSZip();
    for (const [index, range] of ranges.entries()) {
      const output = await PDFDocument.create();
      const pages = await output.copyPages(source, range);
      pages.forEach((page) => output.addPage(page));
      const rangeName =
        range.length > 1
          ? `${range[0] + 1}-${range[range.length - 1] + 1}`
          : `${range[0] + 1}`;
      zip.file(
        `${safeName(baseName(files[0].name))}-pages-${rangeName}.pdf`,
        await output.save(),
      );
      onProgress(Math.round(((index + 1) / ranges.length) * 90));
    }
    return {
      blob: await zip.generateAsync({ type: "blob", compression: "DEFLATE" }),
      filename: "split-pages.zip",
      originalSize,
      details: `${ranges.length} PDF${ranges.length === 1 ? "" : "s"} packed into a ZIP`,
    };
  }

  if (tool === "pdf-compress") {
    const pdf = await PDFDocument.load(await files[0].arrayBuffer());
    pdf.setTitle("");
    pdf.setAuthor("");
    pdf.setSubject("");
    pdf.setKeywords([]);
    pdf.setCreator("");
    pdf.setProducer("");
    const blob = pdfBlob(await pdf.save({ useObjectStreams: true }));
    return {
      blob,
      filename: saveName(files[0].name, "pdf"),
      originalSize,
      details: `${formatBytes(blob.size)} output · metadata removed; embedded images are not re-encoded`,
    };
  }

  if (tool === "pdf-crop") {
    const pdf = await PDFDocument.load(await files[0].arrayBuffer());
    for (const [index, page] of pdf.getPages().entries()) {
      const { width, height } = page.getSize();
      const x = Math.max(0, Math.floor(options.cropX));
      const y = Math.max(0, Math.floor(options.cropY));
      if (x >= width || y >= height) {
        throw new Error(
          `The crop origin is outside page ${index + 1} (${Math.round(width)} × ${Math.round(height)} pt).`,
        );
      }
      const cropWidth = Math.min(Math.floor(options.cropWidth), width - x);
      const cropHeight = Math.min(Math.floor(options.cropHeight), height - y);
      if (cropWidth < 1 || cropHeight < 1) {
        throw new Error("Crop width and height must be at least 1 point.");
      }
      page.setCropBox(x, y, cropWidth, cropHeight);
      onProgress(Math.round(((index + 1) / pdf.getPageCount()) * 90));
    }
    return {
      blob: pdfBlob(await pdf.save()),
      filename: saveName(files[0].name, "pdf"),
      originalSize,
      details: `${pdf.getPageCount()} page${pdf.getPageCount() === 1 ? "" : "s"} cropped`,
    };
  }

  if (tool === "pdf-to-images") {
    const format = options.imageFormat === "image/jpeg" ? "image/jpeg" : "image/png";
    const blob = await pdfToImages(files[0], format, onProgress);
    return {
      blob,
      filename: `${safeName(baseName(files[0].name))}-images.zip`,
      originalSize,
      details: "Each PDF page is included as a separate image",
    };
  }

  if (tool === "document-compress") {
    if (extensionOf(files[0].name) !== "docx") {
      throw new Error(
        "Only .docx files are supported. Legacy .doc files cannot be safely recompressed in the browser.",
      );
    }
    const zip = await JSZip.loadAsync(files[0]);
    const blob = await zip.generateAsync({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });
    return {
      blob,
      filename: saveName(files[0].name, "docx"),
      originalSize,
      details: `${formatBytes(blob.size)} output · package recompressed without removing document content`,
    };
  }

  if (tool === "document-convert") {
    const file = files[0];
    const extension = extensionOf(file.name);
    if (extension === "pdf") {
      const text = await pdfText(file);
      if (!text.trim()) {
        throw new Error(
          "No selectable text was found in this PDF. Scanned pages require OCR before they can be converted to Word.",
        );
      }
      const targetExtension =
        options.documentFormat === "auto" ? "txt" : options.documentFormat;
      if (targetExtension === "docx") {
        const blob = await textToDocx(text);
        return {
          blob,
          filename: saveName(file.name, "docx"),
          originalSize,
          details:
            "Selectable text converted to DOCX; original page layout and embedded images are not preserved",
        };
      }
      if (targetExtension === "pdf") {
        const blob = await createPdfFromText(text);
        return {
          blob,
          filename: saveName(file.name, "pdf"),
          originalSize,
          details: "Selectable text laid out as a new PDF document",
        };
      }
      return {
        blob: new Blob([text], { type: "text/plain;charset=utf-8" }),
        filename: saveName(file.name, "txt"),
        originalSize,
        details: "Selectable text extracted from the PDF",
      };
    }

    const text = await documentText(file);
    const targetExtension =
      options.documentFormat === "auto"
        ? extension === "txt"
          ? "docx"
          : "txt"
        : options.documentFormat;
    if (targetExtension === "docx") {
      return {
        blob: await textToDocx(text),
        filename: saveName(file.name, "docx"),
        originalSize,
        details: "Text saved as a new DOCX document",
      };
    }
    if (targetExtension === "pdf") {
      return {
        blob: await createPdfFromText(text),
        filename: saveName(file.name, "pdf"),
        originalSize,
        details: "Text laid out as a new PDF document",
      };
    }
    return {
      blob: new Blob([text], { type: "text/plain;charset=utf-8" }),
      filename: saveName(file.name, "txt"),
      originalSize,
      details: "Text exported as a plain text file",
    };
  }

  throw new Error("This tool is not available.");
}

export function acceptedFormats(tool: ToolId) {
  switch (tool) {
    case "image-compress":
    case "image-convert":
    case "image-resize":
      return ".jpg,.jpeg,.png,.webp";
    case "images-to-pdf":
      return ".jpg,.jpeg,.png";
    case "pdf-merge":
    case "pdf-compress":
    case "pdf-crop":
      return ".pdf";
    case "pdf-split":
    case "pdf-to-images":
      return ".pdf";
    case "document-compress":
      return ".docx";
    case "document-convert":
      return ".txt,.rtf,.docx,.pdf";
  }
}

export function supportsMultipleFiles(tool: ToolId) {
  return [
    "image-compress",
    "image-convert",
    "image-resize",
    "images-to-pdf",
    "pdf-merge",
  ].includes(tool);
}

export function estimatedOutputLabel(result: ProcessingResult) {
  return formatBytes(result.blob.size);
}
