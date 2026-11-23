import type { Metadata } from "next";
import { Fingerprint } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import EncodeToolWorkspace from "@/components/EncodeToolWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.uuidGenerator;

export const metadata: Metadata = createToolMetadata({
  title: "UUID Generator \u2014 Generate v4 UUIDs Online | Zunvox",
  description:
    "Generate RFC 4122 v4 UUIDs using crypto.randomUUID. Free, private, runs in your browser.",
  path: page.path,
});

export default function UuidGeneratorPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<Fingerprint size={22} />}
      workspace={<EncodeToolWorkspace tool="uuid-generator" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
