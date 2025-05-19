"use client";

import React, { useState } from "react";
import FileExplorer from "@/components/code-snippet/FileExplorer";
import { Button } from "@/components/ui/button";
import { Plus, FileCode } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CodeSnippetsPage() {
  const router = useRouter();

  const handleCreateSnippet = (folderId: string | null) => {
    if (folderId) {
      router.push(`/code-snippet/new?folderId=${folderId}`);
    } else {
      router.push("/code-snippet/new");
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-2">My Code Snippets</h1>
      <p className="text-muted-foreground mb-6">
        Store and organize your code snippets in folders. Click on a snippet to view it.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Explorer */}
        <div className="lg:col-span-4">
          <FileExplorer 
            initialFolderId={null} 
            onCreateSnippet={handleCreateSnippet} 
          />
        </div>
        
        {/* Welcome area */}
        <div className="lg:col-span-8">
          <div className="border rounded-md p-8 text-center flex flex-col items-center justify-center min-h-[400px] bg-background">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileCode size={32} className="text-primary" />
            </div>
            
            <h2 className="text-xl font-medium mb-2">Welcome to Code Snippets</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create and organize your code snippets in folders. Click on a snippet to view it, 
              or create a new snippet to get started.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg"
                onClick={() => router.push("/code-snippet/new")}
                className="flex items-center"
              >
                <Plus size={18} className="mr-1" />
                Create New Snippet
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                onClick={() => {
                  const el = document.querySelector('[title="Create new folder"]');
                  if (el && el instanceof HTMLElement) {
                    el.click();
                  }
                }}
                className="flex items-center"
              >
                <Plus size={18} className="mr-1" />
                Create New Folder
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}