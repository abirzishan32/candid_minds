"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash, Folder, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import CodeEditor from "@/components/code-snippet/CodeEditor";
import SnippetForm from "@/components/code-snippet/SnippetForm";
import { getSnippet, deleteSnippet, getFolderPath } from "@/lib/actions/code-snippet.action";

export default function SnippetPage() {
  const params = useParams();
  const router = useRouter();
  const snippetId = params.snippetId as string;
  
  const [snippet, setSnippet] = useState<CodeSnippet | null>(null);
  const [folderPath, setFolderPath] = useState<CodeFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Fetch snippet data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const snippetResult = await getSnippet(snippetId);
      
      if (snippetResult.success && snippetResult.snippet) {
        setSnippet(snippetResult.snippet);
        
        // If snippet has a folder, fetch the folder path
        if (snippetResult.snippet.folderId) {
          const pathResult = await getFolderPath(snippetResult.snippet.folderId);
          if (pathResult.success) {
            setFolderPath(pathResult.path);
          }
        }
      } else {
        setError(snippetResult.error || "Failed to load snippet");
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
  }, [snippetId]);
  
  const handleDelete = async () => {
    try {
      const result = await deleteSnippet(snippetId);
      
      if (result.success) {
        toast.success("Snippet deleted");
        
        // Navigate back to parent folder or root
        if (snippet?.folderId) {
          router.push(`/code-snippet/folder/${snippet.folderId}`);
        } else {
          router.push("/code-snippet");
        }
      } else {
        toast.error(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleteOpen(false);
    }
  };
  
  // Format the date to be more readable
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  
  return (
    <div className="container mx-auto py-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md">
          {error}
        </div>
      ) : snippet ? (
        <>
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center mb-2">
                <Link 
                  href={snippet.folderId ? `/code-snippet/folder/${snippet.folderId}` : "/code-snippet"}
                  className="text-gray-500 hover:text-blue-600 mr-3"
                >
                  <ArrowLeft size={18} />
                </Link>
                <h1 className="text-2xl font-bold">{snippet.title}</h1>
              </div>
              
              {/* Breadcrumb */}
              {snippet.folderId && (
                <div className="flex items-center text-sm text-gray-500">
                  <Folder size={14} className="mr-1" />
                  <Link href="/code-snippet" className="hover:text-blue-600">
                    Root
                  </Link>
                  {folderPath.map((folder, index) => (
                    <React.Fragment key={folder.id}>
                      <span className="mx-1">/</span>
                      <Link
                        href={`/code-snippet/folder/${folder.id}`}
                        className="hover:text-blue-600"
                      >
                        {folder.name}
                      </Link>
                    </React.Fragment>
                  ))}
                </div>
              )}
              
              <div className="mt-1 text-sm text-gray-500">
                Created: {formatDate(snippet.createdAt)} • Updated: {formatDate(snippet.updatedAt)}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                <Edit size={16} className="mr-1" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteOpen(true)}>
                <Trash size={16} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
          
          {/* Description */}
          {snippet.description && (
            <div className="bg-white dark:bg-gray-950 border rounded-md p-4 mb-6 shadow-sm">
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <p className="text-gray-700 dark:text-gray-300">{snippet.description}</p>
            </div>
          )}
          
          {/* Tags */}
          {snippet.tags && snippet.tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {snippet.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Code Editor */}
          <div className="bg-white dark:bg-gray-950 border rounded-md p-4 shadow-sm">
            <CodeEditor
              code={snippet.code}
              language={snippet.language}
              onChange={() => {}} // Read-only, so no changes
              onLanguageChange={() => {}} // Read-only
              readOnly={true}
            />
          </div>
        </>
      ) : (
        <div className="text-center p-10">
          <p>Snippet not found</p>
        </div>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={isEditOpen && !!snippet} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Snippet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {snippet && (
              <SnippetForm
                snippet={snippet}
                folderId={snippet.folderId}
                onCancel={() => setIsEditOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Snippet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this snippet? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}