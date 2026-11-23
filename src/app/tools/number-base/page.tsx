import type { Metadata } from "next";
import { Hash } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import EncodeToolWorkspace from "@/components/EncodeToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.numberBase;

export const metadata: Metadata = createToolMetadata({
  title: "Number Base Converter \u2014 Binary, Octal, Decimal, Hex | Zunvox",
  description:
    "Convert numbers between binary, octal, decimal, and hexadecimal. Free, private, runs in your browser.",
  path: page.path,
});

export default function NumberBasePage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<Hash size={22} />}
      workspace={<EncodeToolWorkspace tool="number-base" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
