import type { Metadata } from "next";
import { ArrowUpDown } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import TextToolWorkspace from "@/components/TextToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.lineSorter;

export const metadata: Metadata = createToolMetadata({
  title: "Line Sorter \u2014 Sort, Deduplicate & Shuffle Lines | Zunvox",
  description:
    "Sort, reverse, deduplicate, or shuffle lines of text. Free, private, runs in your browser.",
  path: page.path,
});

export default function LineSorterPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<ArrowUpDown size={22} />}
      workspace={<TextToolWorkspace tool="line-sorter" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
