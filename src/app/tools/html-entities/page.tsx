import type { Metadata } from "next";
import { Code2 } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import EncodeToolWorkspace from "@/components/EncodeToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.htmlEntities;

export const metadata: Metadata = createToolMetadata({
  title: "HTML Entity Encoder / Decoder Online \u2014 Free | Zunvox",
  description:
    "Encode or decode HTML special characters and entities. Free, private, runs in your browser.",
  path: page.path,
});

export default function HtmlEntitiesPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<Code2 size={22} />}
      workspace={<EncodeToolWorkspace tool="html-entities" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
