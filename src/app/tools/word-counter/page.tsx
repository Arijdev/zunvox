import type { Metadata } from "next";
import { AlignLeft } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import TextToolWorkspace from "@/components/TextToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.wordCounter;

export const metadata: Metadata = createToolMetadata({
  title: "Word Counter & Text Stats Online \u2014 Free | Zunvox",
  description:
    "Count words, characters, sentences, paragraphs, and reading time instantly. Free, private, runs in your browser.",
  path: page.path,
});

export default function WordCounterPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<AlignLeft size={22} />}
      workspace={<TextToolWorkspace tool="word-counter" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
