"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import FolderTree from "./FolderTree";
import { 
  getFoldersByParent, 
  getSnippetsByFolder,
  getFolderPath
} from "@/lib/actions/code-snippet.action";
import { Button } from "@/components/ui/button";
import { Home, Loader2 } from "lucide-react";

export default function FileExplorer({ 
  initialFolderId = null,
  onCreateSnippet 
}: { 
  initialFolderId: string | null;
  onCreateSnippet: (folderId: string | null) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [currentPath, setCurrentPath] = useState<CodeFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialFolderId);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Get folders
      const foldersResult = await getFoldersByParent(currentFolderId);
      if (foldersResult.success) {
        setFolders(foldersResult.folders);
      }
      
      // Get snippets
      const snippetsResult = await getSnippetsByFolder(currentFolderId);
      if (snippetsResult.success) {
        setSnippets(snippetsResult.snippets);
      }
      
      // Get folder path for breadcrumb
      if (currentFolderId) {
        const pathResult = await getFolderPath(currentFolderId);
        if (pathResult.success) {
          setCurrentPath(pathResult.path);
        }
      } else {
        setCurrentPath([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Watch for changes to the current folder ID
  useEffect(() => {
    setCurrentFolderId(initialFolderId);
  }, [initialFolderId]);
  
  // Fetch data when folder changes
  useEffect(() => {
    fetchData();
  }, [currentFolderId]);
  
  const handleRefresh = () => {
    fetchData();
  };
  
  return (
    <div className="border rounded-md bg-background shadow-sm">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/code-snippet')}
            className="h-8 px-2"
          >
            <Home size={16} className="mr-1" />
            Root
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {/* Total count display */}
          {folders.length} folder{folders.length !== 1 ? 's' : ''}, {snippets.length} snippet{snippets.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <FolderTree
            folders={folders}
            snippets={snippets}
            parentId={currentFolderId}
            onCreateSnippet={onCreateSnippet}
            onRefresh={handleRefresh}
            currentPath={currentPath}
          />
        )}
      </div>
    </div>
  );
}