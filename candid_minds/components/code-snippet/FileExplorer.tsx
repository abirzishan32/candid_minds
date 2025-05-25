"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FolderTree from "./FolderTree";
import { 
  getAllUserFolders, 
  getSnippetsByFolder 
} from "@/lib/actions/code-snippet.action";
import { Button } from "@/components/ui/button";
import { Home, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function FileExplorer({ 
  initialFolderId = null,
  onCreateSnippet 
}: { 
  initialFolderId: string | null;
  onCreateSnippet: (folderId: string | null) => void;
}) {
  const router = useRouter();
  
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter folders for current view
  const currentFolders = folders.filter(folder => folder.parentId === initialFolderId);
  // Filter snippets for current folder
  const currentSnippets = snippets.filter(snippet => snippet.folderId === initialFolderId);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Get ALL user folders for proper tree display
      const foldersResult = await getAllUserFolders();
      if (foldersResult.success) {
        setFolders(foldersResult.folders);
      } else {
        toast.error("Failed to load folders");
      }
      
      // Get snippets for current view
      const snippetsResult = await getSnippetsByFolder(initialFolderId);
      if (snippetsResult.success) {
        setSnippets(snippetsResult.snippets);
      } else {
        toast.error("Failed to load snippets");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while loading data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [initialFolderId]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  // Handle move snippet - implemented here since this component has access to refresh data
  const handleMoveSnippet = (snippet: CodeSnippet) => {
    // The actual implementation is handled in FolderTree component
    // This function is just a pass-through to maintain component hierarchy
    // FolderTree will handle the UI and API calls
    // We just need to ensure it has access to this method
  };
  
  return (
    <div className="border rounded-md bg-background shadow-sm overflow-hidden">
      <div className="p-3 border-b flex justify-between items-center">
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
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
            disabled={refreshing || loading}
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {currentFolders.length} folder{currentFolders.length !== 1 ? 's' : ''}, {currentSnippets.length} snippet{currentSnippets.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="p-2 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <FolderTree
            folders={folders}
            snippets={snippets}
            parentId={initialFolderId}
            currentFolders={currentFolders}
            currentSnippets={currentSnippets}
            onCreateSnippet={onCreateSnippet}
            onRefresh={handleRefresh}
            onMoveSnippet={handleMoveSnippet}
          />
        )}
      </div>
    </div>
  );
}