"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SnippetForm from "@/components/code-snippet/SnippetForm";
import FileExplorer from "@/components/code-snippet/FileExplorer";
import { getFolder } from "@/lib/actions/code-snippet.action";
import { Loader2 } from "lucide-react";

export default function NewSnippetPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const folderId = searchParams.get("folderId");
  
  const [folderInfo, setFolderInfo] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(!!folderId);
  
  useEffect(() => {
    const loadFolderInfo = async () => {
      if (folderId) {
        const folderResult = await getFolder(folderId);
        if (folderResult.success && folderResult.folder) {
          setFolderInfo({
            id: folderResult.folder.id,
            name: folderResult.folder.name,
          });
        }
      }
      setLoading(false);
    };
    
    loadFolderInfo();
  }, [folderId]);
  
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-1">Create New Snippet</h1>
      
      {loading ? (
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading folder information...
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">
          {folderInfo 
            ? `This snippet will be saved in folder: ${folderInfo.name}` 
            : "This snippet will be saved at the root level"}
        </p>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Snippet Form */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <SnippetForm
            folderId={folderId}
            onCancel={() => router.back()}
          />
        </div>
        
        {/* File Explorer */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <FileExplorer 
            initialFolderId={folderId} 
            onCreateSnippet={(newFolderId) => {
              const url = new URL(window.location.href);
              if (newFolderId) {
                url.searchParams.set("folderId", newFolderId);
              } else {
                url.searchParams.delete("folderId");
              }
              window.location.href = url.toString();
            }} 
          />
        </div>
      </div>
    </div>
  );
}