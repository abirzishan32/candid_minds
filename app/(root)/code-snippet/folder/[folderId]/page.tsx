"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, ChevronRight, Code, Folder, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FolderTree from "@/components/code-snippet/FolderTree";
import SnippetForm from "@/components/code-snippet/SnippetForm";
import Link from "next/link";
import { 
  getFolder, getFolderPath, getSnippetsByFolder, getFoldersByParent 
} from "@/lib/actions/code-snippet.action";

export default function FolderPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.folderId as string;
  
  const [folder, setFolder] = useState<CodeFolder | null>(null);
  const [folderPath, setFolderPath] = useState<CodeFolder[]>([]);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [subfolders, setSubfolders] = useState<CodeFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCreateSnippetOpen, setIsCreateSnippetOpen] = useState(false);
  
  // Fetch folder data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [folderResult, pathResult, snippetsResult, subfoldersResult] = await Promise.all([
        getFolder(folderId),
        getFolderPath(folderId),
        getSnippetsByFolder(folderId),
        getFoldersByParent(folderId)
      ]);
      
      if (folderResult.success && folderResult.folder) {
        setFolder(folderResult.folder);
      } else {
        setError(folderResult.error || "Failed to load folder");
      }
      
      if (pathResult.success) {
        setFolderPath(pathResult.path);
      }
      
      if (snippetsResult.success) {
        setSnippets(snippetsResult.snippets);
      } else {
        setError(snippetsResult.error || "Failed to load snippets");
      }
      
      if (subfoldersResult.success) {
        setSubfolders(subfoldersResult.folders);
      } else {
        setError(subfoldersResult.error || "Failed to load subfolders");
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
  }, [folderId]);
  
  const handleCreateSnippet = () => {
    setIsCreateSnippetOpen(true);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{folder?.name || "Loading..."}</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Link href="/code-snippet" className="flex items-center hover:text-blue-600">
              <Home size={14} className="mr-1" />
              Root
            </Link>
            {folderPath.map((pathItem, index) => (
              <React.Fragment key={pathItem.id}>
                <ChevronRight size={14} className="mx-1" />
                <Link 
                  href={`/code-snippet/folder/${pathItem.id}`}
                  className={`hover:text-blue-600 ${pathItem.id === folderId ? "text-blue-600" : ""}`}
                >
                  {pathItem.name}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>
        <Button onClick={handleCreateSnippet}>
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
            <div className="mb-4">
              <Link href="/code-snippet" className="flex items-center text-sm text-gray-500 hover:text-blue-600">
                <ArrowLeft size={14} className="mr-1" /> Back to Root
              </Link>
            </div>
            
            <FolderTree 
              folders={subfolders} 
              snippets={snippets}
              parentId={folderId}
              onCreateSnippet={handleCreateSnippet}
              onRefresh={fetchData}
            />
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-950 border rounded-md p-6 shadow-sm min-h-[400px]">
              {snippets.length === 0 && subfolders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <Folder size={48} className="text-gray-400" />
                  <h2 className="text-xl font-medium">Empty Folder</h2>
                  <p className="text-gray-500 max-w-md">
                    This folder is empty. Create snippets or subfolders to organize your code.
                  </p>
                  <Button onClick={handleCreateSnippet}>
                    <Plus size={16} className="mr-2" />
                    New Snippet
                  </Button>
                </div>
              ) : (
                <div>
                  {/* Render folder contents here - we'll just show a message for now */}
                  <p className="text-gray-500">
                    Select a snippet from the sidebar to view its contents.
                  </p>
                </div>
              )}
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
              folderId={folderId}
              onCancel={() => setIsCreateSnippetOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}