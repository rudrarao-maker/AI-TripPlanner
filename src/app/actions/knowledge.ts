"use server";

import { insertKnowledge } from "@/lib/rag";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addKnowledgeAction(formData: FormData) {
  try {
    // 1. Enforce RBAC
    await requireAdmin();

    const content = formData.get("content")?.toString();
    const source = formData.get("source")?.toString();
    const location = formData.get("location")?.toString();

    if (!content || content.trim().length < 10) {
      return { error: "Content must be at least 10 characters long." };
    }

    // 2. Insert into RAG pipeline
    await insertKnowledge(content, { source, location });

    // 3. Revalidate if necessary
    revalidatePath("/admin/knowledge");

    return { success: true };
  } catch (error: any) {
    console.error("Knowledge Ingestion Error:", error);
    return { error: error.message || "Failed to ingest knowledge." };
  }
}
