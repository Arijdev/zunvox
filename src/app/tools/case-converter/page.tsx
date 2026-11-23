import type { Metadata } from "next";
import { Type } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import TextToolWorkspace from "@/components/TextToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.caseConverter;

export const metadata: Metadata = createToolMetadata({
  title: "Text Case Converter Online \u2014 Free | Zunvox",
  description:
    "Convert text to UPPER, lower, Title, camelCase, snake_case, and more. Free, runs in your browser.",
  path: page.path,
});

export default function CaseConverterPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<Type size={22} />}
      workspace={<TextToolWorkspace tool="case-converter" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
