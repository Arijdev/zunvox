import type { Metadata } from "next";
import { FileText } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import TextToolWorkspace from "@/components/TextToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.loremIpsum;

export const metadata: Metadata = createToolMetadata({
  title: "Lorem Ipsum Generator \u2014 Free Placeholder Text | Zunvox",
  description:
    "Generate paragraphs of lorem ipsum placeholder text instantly. Free, private, runs in your browser.",
  path: page.path,
});

export default function LoremIpsumPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<FileText size={22} />}
      workspace={<TextToolWorkspace tool="lorem-ipsum" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
