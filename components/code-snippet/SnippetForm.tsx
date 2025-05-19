"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TagInput } from "@/components/ui/tag-input";
import CodeEditor from "./CodeEditor";
import { createSnippet, updateSnippet } from "@/lib/actions/code-snippet.action";

interface SnippetFormProps {
  snippet?: CodeSnippet;
  folderId: string | null;
  onCancel: () => void;
}

export default function SnippetForm({ snippet, folderId, onCancel }: SnippetFormProps) {
  const router = useRouter();
  const isEditing = !!snippet;
  
  const [title, setTitle] = useState(snippet?.title || "");
  const [description, setDescription] = useState(snippet?.description || "");
  const [code, setCode] = useState(snippet?.code || "");
  const [language, setLanguage] = useState(snippet?.language || "javascript");
  const [tags, setTags] = useState<string[]>(snippet?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (!code.trim()) {
      toast.error("Code content is required");
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (isEditing && snippet) {
        // Update existing snippet
        const result = await updateSnippet(snippet.id, {
          title,
          description,
          code,
          language,
          tags,
        });
        
        if (result.success) {
          toast.success("Snippet updated successfully");
          router.push(`/code-snippet/${snippet.id}`);
          router.refresh();
        } else {
          toast.error(`Failed to update snippet: ${result.error}`);
        }
      } else {
        // Create new snippet
        const result = await createSnippet({
          title,
          description,
          code,
          language,
          tags,
          folderId,
        });
        
        if (result.success && result.snippet) {
          toast.success("Snippet created successfully");
          router.push(`/code-snippet/${result.snippet.id}`);
          router.refresh();
        } else {
          toast.error(`Failed to create snippet: ${result.error}`);
        }
      }
    } catch (error) {
      toast.error(`An error occurred: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Snippet title"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the code snippet"
          className="mt-1 h-24"
        />
      </div>
      
      <div>
        <Label>Tags (optional)</Label>
        <TagInput 
          value={tags} 
          onChange={setTags} 
          placeholder="Add tags and press Enter"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label>Code</Label>
        <div className="mt-1">
          <CodeEditor
            code={code}
            language={language}
            onChange={setCode}
            onLanguageChange={setLanguage}
            onSave={handleSubmit}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="mr-1">{isEditing ? "Updating..." : "Creating..."}</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </>
          ) : (
            isEditing ? "Update Snippet" : "Create Snippet"
          )}
        </Button>
      </div>
    </form>
  );
}