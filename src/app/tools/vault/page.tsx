import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import ToolWorkspaceLayout from "@/components/ToolWorkspaceLayout";
import VaultModule from "@/components/VaultModule";
import { toolPageContent } from "@/lib/tool-content";
import { createToolMetadata } from "@/lib/seo";

const page = toolPageContent.vault;

export const metadata: Metadata = createToolMetadata({
  title: "Zunvox Vault — Private Zero-Knowledge File Encryption",
  description:
    "Encrypt and decrypt files privately in your browser with AES-256-GCM and PBKDF2. Your files, passphrase, and keys never leave your device.",
  path: page.path,
});

export default function VaultPage() {
  return (
    <ToolWorkspaceLayout
      title={page.title}
      description={page.description}
      path={page.path}
      icon={<LockKeyhole size={22} />}
      workspace={<VaultModule />}
      steps={page.steps}
      features={page.features}
      faqs={page.faqs}
      relatedTools={page.relatedTools}
    />
  );
}
