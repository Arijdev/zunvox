import type { Metadata } from "next";
import { Palette } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import EncodeToolWorkspace from "@/components/EncodeToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.colorConverter;

export const metadata: Metadata = createToolMetadata({
  title: "Color Converter \u2014 HEX, RGB, HSL Online | Zunvox",
  description:
    "Convert colors between HEX, RGB, and HSL with a live preview. Free, private, runs in your browser.",
  path: page.path,
});

export default function ColorConverterPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<Palette size={22} />}
      workspace={<EncodeToolWorkspace tool="color-converter" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
