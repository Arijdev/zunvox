import type { Metadata } from "next";
import { Minimize2 } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import ToolProcessor from "@/components/ToolProcessor";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.imageCompressor;

export const metadata: Metadata = createToolMetadata({
  title: "Compress Images Online — Reduce JPG, PNG & WebP Size | Zunvox",
  description:
    "Fast, private client-side image compression. Reduce image file sizes in your browser without losing quality. No sign-up needed.",
  path: page.path,
});

export default function ImageCompressorPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<Minimize2 size={22} />}
      workspace={<ToolProcessor tool="image-compress" />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
