import type { Metadata } from "next";
import { Link2 } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import EncodeToolWorkspace from "@/components/EncodeToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.urlEncoder;

export const metadata: Metadata = createToolMetadata({
  title: "URL Encoder / Decoder Online \u2014 Free | Zunvox",
  description:
    "Encode or decode URLs and query strings. Free, private, runs in your browser.",
  path: page.path,
});

export default function UrlEncoderPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<Link2 size={22} />}
      workspace={<EncodeToolWorkspace tool="url-encoder" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
