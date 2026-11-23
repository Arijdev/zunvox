import type { Metadata } from "next";
import { Braces } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import EncodeToolWorkspace from "@/components/EncodeToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.jsonFormatter;

export const metadata: Metadata = createToolMetadata({
  title: "JSON Formatter & Validator Online \u2014 Free | Zunvox",
  description:
    "Prettify, minify, and validate JSON data instantly. Free, private, runs in your browser.",
  path: page.path,
});

export default function JsonFormatterPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<Braces size={22} />}
      workspace={<EncodeToolWorkspace tool="json-formatter" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
