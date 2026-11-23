import type { Metadata } from "next";
import { Replace } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import TextToolWorkspace from "@/components/TextToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.findReplace;

export const metadata: Metadata = createToolMetadata({
  title: "Find & Replace Text Online \u2014 Free | Zunvox",
  description:
    "Find and replace text with live preview. Free, private, runs in your browser.",
  path: page.path,
});

export default function FindReplacePage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<Replace size={22} />}
      workspace={<TextToolWorkspace tool="find-replace" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
