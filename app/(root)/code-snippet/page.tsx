"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Code, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FolderTree from "@/components/code-snippet/FolderTree";
import { getSnippetsByFolder, getFoldersByParent } from "@/lib/actions/code-snippet.action";
import { Separator } from "@/components/ui/separator";
import SnippetForm from "@/components/code-snippet/SnippetForm";

export default function CodeSnippetPage() {
  const router = useRouter();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCreateSnippetOpen, setIsCreateSnippetOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  
  // Fetch root level snippets and folders
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [snippetsResult, foldersResult] = await Promise.all([
        getSnippetsByFolder(null),
        getFoldersByParent(null)
      ]);
      
      if (snippetsResult.success) {
        setSnippets(snippetsResult.snippets);
      } else {
        setError(snippetsResult.error || "Failed to load snippets");
      }
      
      if (foldersResult.success) {
        setFolders(foldersResult.folders);
      } else {
        setError(foldersResult.error || "Failed to load folders");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleCreateSnippet = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    setIsCreateSnippetOpen(true);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Code Snippets</h1>
        <Button onClick={() => handleCreateSnippet(null)}>
          <Plus size={16} className="mr-2" />
          New Snippet
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 border rounded-md p-4 bg-white dark:bg-gray-950 shadow-sm">
            <FolderTree 
              folders={folders} 
              snippets={snippets}
              parentId={null}
              onCreateSnippet={handleCreateSnippet}
              onRefresh={fetchData}
            />
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-950 border rounded-md p-6 shadow-sm min-h-[400px]">
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <Code size={48} className="text-gray-400" />
                <h2 className="text-xl font-medium">Your Code Snippets</h2>
                <p className="text-gray-500 max-w-md">
                  Create and organize your code snippets for easy access later. 
                  Select a snippet to view it, or create a new one.
                </p>
                <Button onClick={() => handleCreateSnippet(null)}>
                  <Plus size={16} className="mr-2" />
                  New Snippet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Snippet Dialog */}
      <Dialog open={isCreateSnippetOpen} onOpenChange={setIsCreateSnippetOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Snippet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <SnippetForm
              folderId={selectedFolderId}
              onCancel={() => setIsCreateSnippetOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}