import type { Metadata } from "next";
import {
  Combine,
  FileImage,
  FileStack,
  FileText,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Scissors,
} from "lucide-react";
import { notFound } from "next/navigation";
import ToolProcessor from "@/components/ToolProcessor";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import { createToolMetadata } from "@/lib/seo";
import { utilityTools, utilityToolBySlug } from "@/lib/utility-tools";
import type { ToolId } from "@/lib/processors";

export const instant = false;

const existingRoutes = new Set([
  "image-compressor",
  "pdf-to-word",
  "ocr",
  "summarize",
  "vault",
]);

const iconBySlug = {
  "image-compressor": Minimize2,
  "pdf-compressor": FileText,
  "word-compressor": FileStack,
  "image-to-pdf": FileImage,
  "image-converter": ImageIcon,
  "pdf-to-images": FileImage,
  "document-converters": FileStack,
  "image-resizer": Maximize2,
  "pdf-crop": Maximize2,
  "pdf-merge": Combine,
  "pdf-split": Scissors,
} as const;

const defaultFAQs = [
  {
    question: "Are my files uploaded to Zunvox?",
    answer:
      "No. This tool processes your files locally in your browser and does not upload them to Zunvox.",
  },
  {
    question: "Is this tool free to use?",
    answer: "Yes. Zunvox tools are free to use without an account.",
  },
  {
    question: "Which files can I process?",
    answer:
      "The accepted file formats are listed in the workspace. The browser may limit processing of very large files based on available memory.",
  },
];

export function generateStaticParams() {
  return utilityTools
    .filter((tool) => tool.processor && !existingRoutes.has(tool.slug))
    .map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tool = utilityToolBySlug.get(slug);
  if (!tool || !tool.processor || existingRoutes.has(slug)) return {};

  return createToolMetadata({
    title: `${tool.title} Online — Free, Private & In-Browser | Zunvox`,
    description: `Zunvox ${tool.title.toLowerCase()} processes files locally in your browser, with no uploads or account required.`,
    path: `/tools/${slug}`,
  });
}

export default async function UtilityToolPage({
  params,
}: PageProps<"/tools/[slug]">) {
  const { slug } = await params;
  const tool = utilityToolBySlug.get(slug);
  if (!tool || !tool.processor || existingRoutes.has(slug)) notFound();

  const Icon = iconBySlug[slug as keyof typeof iconBySlug];
  if (!Icon) notFound();
  const pagePath = `/tools/${slug}`;
  const relatedTools = utilityTools
    .filter((item) => item.slug !== slug)
    .slice(0, 4)
    .map((item) => ({
      href: `/tools/${item.slug}`,
      title: item.title,
      description: item.description,
    }));

  return (
    <ToolWorkspaceLayout
      title={tool.title}
      description={tool.description}
      path={pagePath}
      icon={<Icon size={22} />}
      workspace={
        <ToolProcessor
          tool={tool.processor as ToolId}
          defaultDocumentFormat={
            slug === "pdf-to-word" ? "docx" : "auto"
          }
        />
      }
      steps={[
        `Choose a supported file from your device for ${tool.title.toLowerCase()}.`,
        "Adjust the available options, then run the tool in your browser.",
        "Review the result and download the processed file.",
      ]}
      features={[
        "File processing runs locally in your browser; your document is not uploaded to Zunvox.",
        "Use the dedicated workspace to configure the operation before processing.",
        "Download the result directly to your device.",
        "No account, sign-up, or paid API required.",
      ]}
      faqs={defaultFAQs}
      relatedTools={relatedTools}
    />
  );
}
