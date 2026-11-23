import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import PasswordGeneratorWorkspace from "@/components/PasswordGeneratorWorkspace";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.passwordGenerator;

export const metadata: Metadata = createToolMetadata({
  title: "Password Generator \u2014 Strong Random Passwords | Zunvox",
  description:
    "Generate strong, random passwords with custom options using crypto.getRandomValues. Free, private.",
  path: page.path,
});

export default function PasswordGeneratorPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<KeyRound size={22} />}
      workspace={<PasswordGeneratorWorkspace />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
