import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import EncodeToolWorkspace from "@/components/EncodeToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.hashGenerator;

export const metadata: Metadata = createToolMetadata({
  title: "Hash Generator \u2014 SHA-256, SHA-1, SHA-512 Online | Zunvox",
  description:
    "Generate SHA-256, SHA-1, and SHA-512 hashes from text using the Web Crypto API. Free, private.",
  path: page.path,
});

export default function HashGeneratorPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<ShieldCheck size={22} />}
      workspace={<EncodeToolWorkspace tool="hash-generator" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
