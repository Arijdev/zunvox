import type { Metadata } from "next";
import { Binary } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import EncodeToolWorkspace from "@/components/EncodeToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.base64;

export const metadata: Metadata = createToolMetadata({
  title: "Base64 Encoder / Decoder Online \u2014 Free | Zunvox",
  description:
    "Encode or decode text to and from Base64 instantly. Free, private, runs in your browser.",
  path: page.path,
});

export default function Base64Page() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<Binary size={22} />}
      workspace={<EncodeToolWorkspace tool="base64" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
