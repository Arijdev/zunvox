import type { Metadata } from "next";
import { GitCompare } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import TextToolWorkspace from "@/components/TextToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.textDiff;

export const metadata: Metadata = createToolMetadata({
  title: "Text Diff Viewer \u2014 Compare Two Texts Online | Zunvox",
  description:
    "Compare two texts and highlight added and removed lines. Free, private, runs in your browser.",
  path: page.path,
});

export default function TextDiffPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<GitCompare size={22} />}
      workspace={<TextToolWorkspace tool="text-diff" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
