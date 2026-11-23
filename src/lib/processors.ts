import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

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
  | "pdf-rotate"
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
  pdfTargetReduction: number;
  documentTargetReduction: number;
  rotateAngle?: 90 | 180 | 270;
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
            Math.max(1, options.maxWidth) / sourceWidth,
            Math.max(1, options.maxHeight) / sourceHeight,
          )
        : 1;
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare the image canvas.");
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
  const trimmed = input.trim();
  if (!trimmed || trimmed.toLowerCase() === "all") {
    return [Array.from({ length: pageCount }, (_, index) => index)];
  }

  const ranges = trimmed
    .split(/[,;\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (ranges.length === 0) throw new Error("Enter at least one page or page range.");

  return ranges.map((range) => {
    const match = range.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) {
      throw new Error(`Invalid page range "${range}". Use format like "1, 3-5, 8".`);
    }
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < start || end > pageCount) {
      throw new Error(`Page range "${range}" is outside this ${pageCount}-page PDF.`);
    }
    return Array.from({ length: end - start + 1 }, (_, index) => start - 1 + index);
  });
}

function normalizeForPdf(input: string): string {
  return input
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\u2014/g, " -- ")
    .replace(/\u2013/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2022/g, "* ")
    .replace(/[\u00A0\u2002\u2003\u2009]/g, " ")
    .replace(/\u00A9/g, "(c)")
    .replace(/\u00AE/g, "(R)")
    .replace(/\u2122/g, "(TM)")
    .replace(/[^\x20-\x7E\t\n\r]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 160 && code <= 255) return char;
      const norm = char.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (norm.length === 1 && norm.charCodeAt(0) >= 32 && norm.charCodeAt(0) <= 126) return norm;
      return " ";
    });
}

async function createPdfFromText(text: string) {
  const pdf = await PDFDocument.create();
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 612; // Standard Letter
  const pageHeight = 792;
  const marginX = 54;
  const marginTop = 54;
  const marginBottom = 54;
  const maxContentWidth = pageWidth - marginX * 2;

  const rawParagraphs = normalizeForPdf(text).split(/\r?\n/);
  const pages: Array<{
    page: ReturnType<typeof pdf.addPage>;
  }> = [];

  let currentPage = pdf.addPage([pageWidth, pageHeight]);
  pages.push({ page: currentPage });
  let currentY = pageHeight - marginTop;

  function ensureSpace(neededHeight: number) {
    if (currentY - neededHeight < marginBottom) {
      currentPage = pdf.addPage([pageWidth, pageHeight]);
      pages.push({ page: currentPage });
      currentY = pageHeight - marginTop;
    }
  }

  for (const rawPara of rawParagraphs) {
    const trimmed = rawPara.trim();
    if (!trimmed) {
      // Empty line / paragraph break
      currentY -= 10;
      if (currentY < marginBottom) {
        currentPage = pdf.addPage([pageWidth, pageHeight]);
        pages.push({ page: currentPage });
        currentY = pageHeight - marginTop;
      }
      continue;
    }

    const isHeading = trimmed.startsWith("# ");
    const paraText = isHeading ? trimmed.slice(2).trim() : rawPara;
    const font = isHeading ? fontBold : fontRegular;
    const fontSize = isHeading ? 14 : 10;
    const lineHeight = isHeading ? 18 : 14;
    const fontColor = isHeading ? rgb(0.08, 0.12, 0.18) : rgb(0.15, 0.18, 0.23);

    if (isHeading) {
      // Extra space before headings
      currentY -= 6;
    }

    // Word-wrap using font measurement
    const words = paraText.split(/\s+/);
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth <= maxContentWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          ensureSpace(lineHeight);
          currentPage.drawText(currentLine, {
            x: marginX,
            y: currentY - fontSize,
            size: fontSize,
            font,
            color: fontColor,
          });
          currentY -= lineHeight;
        }

        // If the single word is itself wider than maxContentWidth, split it
        const wordWidth = font.widthOfTextAtSize(word, fontSize);
        if (wordWidth > maxContentWidth) {
          let partial = "";
          for (const char of word) {
            if (font.widthOfTextAtSize(partial + char, fontSize) > maxContentWidth) {
              ensureSpace(lineHeight);
              currentPage.drawText(partial, {
                x: marginX,
                y: currentY - fontSize,
                size: fontSize,
                font,
                color: fontColor,
              });
              currentY -= lineHeight;
              partial = char;
            } else {
              partial += char;
            }
          }
          currentLine = partial;
        } else {
          currentLine = word;
        }
      }
    }

    if (currentLine) {
      ensureSpace(lineHeight);
      currentPage.drawText(currentLine, {
        x: marginX,
        y: currentY - fontSize,
        size: fontSize,
        font,
        color: fontColor,
      });
      currentY -= lineHeight;
    }

    // Small paragraph spacing
    currentY -= isHeading ? 6 : 4;
  }

  // Draw clean page footers with page numbers
  const totalPages = pages.length;
  for (let i = 0; i < totalPages; i++) {
    const p = pages[i].page;
    const pageNumberText = `Page ${i + 1} of ${totalPages}`;
    const numWidth = fontRegular.widthOfTextAtSize(pageNumberText, 9);
    p.drawText(pageNumberText, {
      x: (pageWidth - numWidth) / 2,
      y: 28,
      size: 9,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.6),
    });
  }

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
    .map((line) => {
      const trimmed = line.trim();
      const isHeading = trimmed.startsWith("# ");
      const cleanText = isHeading ? trimmed.slice(2).trim() : line;
      const pPr = isHeading
        ? '<w:pPr><w:pStyle w:val="Heading1"/><w:spacing w:before="240" w:after="120"/><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/><w:color w:val="1E293B"/></w:rPr></w:pPr>'
        : '<w:pPr><w:spacing w:after="140" w:line="276" w:lineRule="auto"/><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:color w:val="0F172A"/></w:rPr></w:pPr>';
      const rPr = isHeading
        ? '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/><w:color w:val="1E293B"/></w:rPr>'
        : '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:color w:val="0F172A"/></w:rPr>';
      return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(cleanText)}</w:t></w:r></w:p>`;
    })
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
      `<w:body>${paragraphs}<w:sectPr><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>`,
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

    const body = xml.getElementsByTagName("w:body")[0];
    if (!body) return "";

    const parts: string[] = [];

    for (const child of Array.from(body.childNodes)) {
      const nodeName = child.nodeName;
      if (nodeName === "w:p") {
        let paraText = "";
        let isHeading = false;
        const elem = child as Element;
        const pPr = elem.getElementsByTagName("w:pPr")[0];
        if (pPr) {
          const pStyle = pPr.getElementsByTagName("w:pStyle")[0];
          const val = pStyle?.getAttribute("w:val") || "";
          if (/heading|title/i.test(val)) isHeading = true;
        }

        for (const pChild of Array.from(elem.childNodes)) {
          if (pChild.nodeName === "w:r") {
            for (const rChild of Array.from(pChild.childNodes)) {
              if (rChild.nodeName === "w:t") {
                paraText += rChild.textContent ?? "";
              } else if (rChild.nodeName === "w:tab") {
                paraText += "\t";
              } else if (rChild.nodeName === "w:br") {
                paraText += "\n";
              }
            }
          }
        }
        const trimmed = paraText.trim();
        if (trimmed) {
          parts.push(isHeading ? `# ${trimmed}` : paraText);
        } else {
          parts.push("");
        }
      } else if (nodeName === "w:tbl") {
        const rows = Array.from((child as Element).getElementsByTagName("w:tr"));
        for (const row of rows) {
          const cells = Array.from(row.getElementsByTagName("w:tc")).map((tc) => {
            const pTags = Array.from(tc.getElementsByTagName("w:p"));
            return pTags
              .map((p) =>
                Array.from(p.getElementsByTagName("w:t"))
                  .map((t) => t.textContent ?? "")
                  .join(""),
              )
              .join(" ")
              .trim();
          });
          if (cells.some((c) => c.length > 0)) {
            parts.push(cells.join("  |  "));
          }
        }
        parts.push("");
      }
    }
    return parts.join("\n");
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
    const pagesText: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();

      type TextItem = { str: string; x: number; y: number; height: number };
      const items: TextItem[] = [];

      for (const item of content.items) {
        if ("str" in item && item.str) {
          const transform = item.transform;
          items.push({
            str: item.str,
            x: transform[4],
            y: transform[5],
            height: Math.abs(transform[3]) || 12,
          });
        }
      }

      if (items.length === 0) {
        pagesText.push("");
        continue;
      }

      // Sort items top-to-bottom (y descending), then left-to-right (x ascending)
      items.sort((a, b) => {
        const yDiff = Math.abs(a.y - b.y);
        if (yDiff > 3) return b.y - a.y;
        return a.x - b.x;
      });

      const lines: string[] = [];
      let currentLine = "";
      let lastY = items[0].y;
      let lastX = items[0].x;
      let lastHeight = items[0].height;

      for (const item of items) {
        const yDiff = Math.abs(item.y - lastY);
        if (yDiff > Math.max(3, lastHeight * 0.5)) {
          if (currentLine.trim()) lines.push(currentLine.trim());
          if (yDiff > lastHeight * 1.6) {
            lines.push("");
          }
          currentLine = item.str;
        } else {
          const spaceNeeded =
            item.x > lastX + 2 &&
            !currentLine.endsWith(" ") &&
            !item.str.startsWith(" ");
          currentLine += (spaceNeeded ? " " : "") + item.str;
        }
        lastY = item.y;
        lastX = item.x + item.str.length * lastHeight * 0.45;
        lastHeight = item.height;
      }
      if (currentLine.trim()) lines.push(currentLine.trim());

      pagesText.push(lines.join("\n"));
    }
    return pagesText.join("\n\n");
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
    // Standard A4 dimensions
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 36;
    const maxContentWidth = pageWidth - margin * 2;
    const maxContentHeight = pageHeight - margin * 2;

    for (const [index, file] of files.entries()) {
      const bytes = await file.arrayBuffer();
      const image =
        file.type === "image/png"
          ? await pdf.embedPng(bytes)
          : await pdf.embedJpg(bytes);

      const scale = Math.min(
        maxContentWidth / image.width,
        maxContentHeight / image.height,
        1,
      );
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const x = (pageWidth - drawWidth) / 2;
      const y = (pageHeight - drawHeight) / 2;

      const page = pdf.addPage([pageWidth, pageHeight]);
      page.drawImage(image, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      });
      onProgress(Math.round(((index + 1) / files.length) * 90));
    }
    return {
      blob: pdfBlob(await pdf.save()),
      filename: "images-to-pdf.pdf",
      originalSize,
      details: `${files.length} image${files.length === 1 ? "" : "s"} formatted into standard A4 PDF`,
    };
  }

  if (tool === "pdf-rotate") {
    const angle = options.rotateAngle || 90;
    const pdf = await PDFDocument.load(await files[0].arrayBuffer());
    const pageCount = pdf.getPageCount();
    const pagesToRotate =
      options.pageRanges &&
      options.pageRanges.trim() &&
      options.pageRanges.trim().toLowerCase() !== "all"
        ? parsePageRanges(options.pageRanges, pageCount).flat()
        : Array.from({ length: pageCount }, (_, i) => i);

    for (const pageIndex of pagesToRotate) {
      const page = pdf.getPage(pageIndex);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + angle) % 360));
    }

    const blob = pdfBlob(await pdf.save());
    return {
      blob,
      filename: saveName(files[0].name, "pdf"),
      originalSize,
      details: `${pagesToRotate.length} of ${pageCount} page${pageCount === 1 ? "" : "s"} rotated by ${angle}°`,
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
    const reduction = Math.min(90, Math.max(0, options.pdfTargetReduction || 0));
    const scale = Math.max(0.35, 1 - reduction / 140);
    const jpegQuality = Math.max(0.25, 0.92 - reduction / 115);
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const loadingTask = pdfjs.getDocument({ data: await files[0].arrayBuffer() });
    try {
      const source = await loadingTask.promise;
      const output = await PDFDocument.create();
      for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
        const page = await source.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = window.document.createElement("canvas");
        canvas.width = Math.max(1, Math.ceil(viewport.width));
        canvas.height = Math.max(1, Math.ceil(viewport.height));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Your browser could not prepare the PDF page.");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        const imageBlob = await canvasBlob(canvas, "image/jpeg", jpegQuality);
        const imageBytes = await imageBlob.arrayBuffer();
        const image = await output.embedJpg(imageBytes);
        const outPage = output.addPage([canvas.width, canvas.height]);
        outPage.drawImage(image, {
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
        });
        onProgress(Math.round((pageNumber / source.numPages) * 90));
      }
      const blob = pdfBlob(await output.save({ useObjectStreams: true }));
      return {
        blob,
        filename: saveName(files[0].name, "pdf"),
        originalSize,
        details: `${formatBytes(blob.size)} output · target ${reduction}% reduction; pages re-rendered as images`,
      };
    } finally {
      await loadingTask.destroy();
    }
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
    const reduction = Math.min(90, Math.max(0, options.documentTargetReduction || 0));
    const scale = Math.max(0.4, 1 - reduction / 150);
    const jpegQuality = Math.max(0.3, 0.92 - reduction / 120);
    const zip = await JSZip.loadAsync(files[0]);
    const mediaPaths = Object.keys(zip.files).filter((path) =>
      /^word\/media\//i.test(path),
    );
    let processed = 0;
    for (const path of mediaPaths) {
      const entry = zip.file(path);
      if (!entry) continue;
      const ext = extensionOf(path);
      const isJpeg = ext === "jpg" || ext === "jpeg";
      const isPng = ext === "png";
      const isWebp = ext === "webp";
      if (!isJpeg && !isPng && !isWebp) {
        processed += 1;
        continue;
      }
      const data = await entry.async("uint8array");
      const buffer = new ArrayBuffer(data.byteLength);
      new Uint8Array(buffer).set(data);
      const mime = isJpeg
        ? "image/jpeg"
        : isPng
          ? "image/png"
          : "image/webp";
      const file = new File([buffer], path, { type: mime });
      try {
        const image = await getImage(file);
        const canvas = window.document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Your browser could not prepare the image canvas.");
        const outMime = isPng ? "image/png" : "image/jpeg";
        if (outMime === "image/jpeg") {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const outBlob = await canvasBlob(canvas, outMime, outMime === "image/jpeg" ? jpegQuality : 0.92);
        const outPath = isPng ? path : path.replace(/\.(webp)$/i, ".jpg");
        const outBytes = new Uint8Array(await outBlob.arrayBuffer());
        if (outPath !== path) {
          zip.remove(path);
        }
        zip.file(outPath, outBytes, { binary: true });
        if (outPath !== path) {
          const relPath = path.replace(/^word\//, "");
          const relOut = outPath.replace(/^word\//, "");
          const relsFile = zip.file("word/_rels/document.xml.rels");
          if (relsFile) {
            const rels = await relsFile.async("text");
            zip.file("word/_rels/document.xml.rels", rels.split(relPath).join(relOut));
          }
        }
      } catch {
        zip.file(path, data, { binary: true });
      }
      processed += 1;
      if (mediaPaths.length) {
        onProgress(Math.round((processed / mediaPaths.length) * 70));
      }
    }
    const compressionLevel = Math.min(
      9,
      Math.max(1, Math.round(1 + reduction / 11)),
    ) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    const blob = await zip.generateAsync({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      compression: "DEFLATE",
      compressionOptions: { level: compressionLevel },
    });
    return {
      blob,
      filename: saveName(files[0].name, "docx"),
      originalSize,
      details: `${formatBytes(blob.size)} output · target ${reduction}% reduction; embedded images recompressed where possible`,
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
    case "pdf-rotate":
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
