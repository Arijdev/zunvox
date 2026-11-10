import type { Metadata } from "next";
import { FileText } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import ToolProcessor from "@/components/ToolProcessor";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.pdfToWord;

export const metadata: Metadata = createToolMetadata({
  title: "Free PDF to Word Converter — 100% Private & In-Browser | Zunvox",
  description:
    "Convert PDF files into editable Word documents directly in your browser. Zero server uploads, completely free, and secure client-side execution.",
  path: page.path,
});

export default function PdfToWordPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<FileText size={22} />}
      workspace={
        <ToolProcessor tool="document-convert" defaultDocumentFormat="docx" />
      }
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
