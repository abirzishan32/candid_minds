"use client";
import React from "react";
import { Metadata } from "next";
import FileExplorer from "@/components/code-snippet/FileExplorer";
import SnippetForm from "@/components/code-snippet/SnippetForm";
import { Button } from "@/components/ui/button";



export default function CodeSnippetsPage() {
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">My Code Snippets</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Explorer */}
        <div className="lg:col-span-4">
          <FileExplorer 
            initialFolderId={null} 
            onCreateSnippet={(folderId) => {
              const url = new URL(window.location.href);
              url.pathname = "/code-snippet/new";
              if (folderId) {
                url.searchParams.set("folderId", folderId);
              }
              window.location.href = url.toString();
            }} 
          />
        </div>
        
        {/* Welcome area */}
        <div className="lg:col-span-8">
          <div className="border rounded-md p-8 text-center flex flex-col items-center justify-center min-h-[400px] bg-background">
            <h2 className="text-xl font-medium mb-2">Welcome to Code Snippets</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create and organize your code snippets in folders. Click on a snippet to view it, 
              or create a new snippet to get started.
            </p>
            
            <Button 
              size="lg"
              onClick={() => {
                const url = new URL(window.location.href);
                url.pathname = "/code-snippet/new";
                window.location.href = url.toString();
              }}
            >
              Create New Snippet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}