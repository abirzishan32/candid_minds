"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TagInput } from "@/components/ui/tag-input";
import CodeEditor from "./CodeEditor";
import { updateSnippet, getFoldersByParent } from "@/lib/actions/code-snippet.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface EditSnippetFormProps {
  snippet: CodeSnippet;
}

export default function EditSnippetForm({ snippet }: EditSnippetFormProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState(snippet.title);
  const [description, setDescription] = useState(snippet.description || "");
  const [code, setCode] = useState(snippet.code);
  const [language, setLanguage] = useState(snippet.language);
  const [tags, setTags] = useState<string[]>(snippet.tags || []);
  const [folderId, setFolderId] = useState<string | null>(snippet.folderId);
  const [isSaving, setIsSaving] = useState(false);
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  
  // Load available folders
  useEffect(() => {
    const loadFolders = async () => {
      setLoadingFolders(true);
      try {
        // Load root folders
        const rootFolderResult = await getFoldersByParent(null);
        let allFolders: CodeFolder[] = [];
        
        if (rootFolderResult.success) {
          allFolders = [...rootFolderResult.folders];
          
          // Load subfolders (one level deep for simplicity)
          for (const folder of rootFolderResult.folders) {
            const subFolderResult = await getFoldersByParent(folder.id);
            if (subFolderResult.success) {
              allFolders = [...allFolders, ...subFolderResult.folders];
            }
          }
        }
        
        setFolders(allFolders);
      } catch (error) {
        console.error("Error loading folders:", error);
      } finally {
        setLoadingFolders(false);
      }
    };
    
    loadFolders();
  }, []);
  
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
      const result = await updateSnippet(snippet.id, {
        title,
        description,
        code,
        language,
        tags,
        folderId,
      });
      
      if (result.success) {
        toast.success("Snippet updated successfully");
        router.push(`/code-snippet/${snippet.id}`);
        router.refresh();
      } else {
        toast.error(`Failed to update snippet: ${result.error}`);
      }
    } catch (error) {
      toast.error(`An error occurred: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-md p-4 bg-background">
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
        <Label htmlFor="folder">Folder</Label>
        <Select 
          value={folderId || ""} 
          onValueChange={(value) => setFolderId(value === "" ? null : value)}
        >
          <SelectTrigger className="mt-1" disabled={loadingFolders}>
            <SelectValue placeholder={loadingFolders ? "Loading folders..." : "Root (No folder)"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Root (No folder)</SelectItem>
            {folders.map((folder) => (
              <SelectItem 
                key={folder.id} 
                value={folder.id}
                className={folder.parentId ? "pl-6" : ""}
              >
                {folder.parentId ? `↪ ${folder.name}` : folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Snippet"
          )}
        </Button>
      </div>
    </form>
  );
}