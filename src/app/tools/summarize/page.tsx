import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import AiToolWorkspace from "@/components/AiToolWorkspace";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.summarize;

export const metadata: Metadata = createToolMetadata({
  title: "Free AI Document Summarizer — In-Browser PDF & Text Summary | Zunvox",
  description:
    "Summarize long PDF reports, articles, and text files instantly using client-side AI. 100% private processing with zero cloud uploads.",
  path: page.path,
});

export default function SummarizePage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<Sparkles size={22} />}
      workspace={<AiToolWorkspace initialTab="summarize" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
