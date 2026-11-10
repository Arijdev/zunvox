import type { Metadata } from "next";
import { ScanText } from "lucide-react";
import AiToolWorkspace from "@/components/AiToolWorkspace";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.ocr;

export const metadata: Metadata = createToolMetadata({
  title: "Free Online OCR — Extract Text from Images & PDFs | Zunvox",
  description:
    "Extract editable text from images and scanned PDF documents using in-browser WebAssembly OCR. Secure, free, and private.",
  path: page.path,
});

export default function OcrPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<ScanText size={22} />}
      workspace={<AiToolWorkspace initialTab="ocr" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
