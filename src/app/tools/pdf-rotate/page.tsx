import type { Metadata } from "next";
import { RotateCw } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import ToolProcessor from "@/components/ToolProcessor";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.pdfRotate;

export const metadata: Metadata = createToolMetadata({
  title: "PDF Page Rotator \u2014 Rotate PDF Pages Online | Zunvox",
  description:
    "Rotate all or selected pages in a PDF by 90, 180, or 270 degrees. Free, private, runs in your browser.",
  path: page.path,
});

export default function PdfRotatePage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<RotateCw size={22} />}
      workspace={<ToolProcessor tool="pdf-rotate" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
