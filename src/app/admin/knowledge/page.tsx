"use client";

import { useState } from "react";
import { addKnowledgeAction } from "@/app/actions/knowledge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Database, Plus, CheckCircle2, AlertCircle } from "lucide-react";

export default function KnowledgeBasePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setStatus(null);
    
    const result = await addKnowledgeAction(formData);
    
    if (result.error) {
      setStatus({ type: 'error', message: result.error });
    } else {
      setStatus({ type: 'success', message: 'Successfully ingested into Vector Database!' });
      // Reset form via DOM trick
      const form = document.getElementById('knowledge-form') as HTMLFormElement;
      if (form) form.reset();
    }
    
    setIsSubmitting(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="bg-primary/10 p-3 rounded-lg text-primary">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">RAG Knowledge Ingestion</h1>
          <p className="text-muted-foreground">Upload travel guides, hidden secrets, and local tips to empower the AI Chatbot.</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <form id="knowledge-form" action={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location Tags (Optional)</label>
              <Input name="location" placeholder="e.g. Paris, France" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source / Type</label>
              <Input name="source" placeholder="e.g. Local Guide, Travel Blog" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Knowledge Content</label>
            <Textarea 
              name="content" 
              placeholder="Paste the travel knowledge here. Be as descriptive as possible so the LLM has good context..." 
              className="min-h-[200px]"
              required
            />
          </div>

          {status && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
              {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <p className="text-sm font-medium">{status.message}</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Plus className="h-4 w-4" />
              {isSubmitting ? "Vectorizing..." : "Add to Knowledge Base"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
