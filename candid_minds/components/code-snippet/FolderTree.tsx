"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Folder, ChevronRight, ChevronDown, File, Plus, MoreVertical, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  createFolder, 
  updateFolder, 
  deleteFolder,
  updateSnippet
} from "@/lib/actions/code-snippet.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FolderTreeProps {
  folders: CodeFolder[];
  snippets: CodeSnippet[];
  parentId: string | null;
  currentFolders: CodeFolder[];
  currentSnippets: CodeSnippet[];
  level?: number;
  onCreateSnippet: (folderId: string | null) => void;
  onRefresh: () => void;
  onMoveSnippet?: (snippet: CodeSnippet) => void;
}

export default function FolderTree({
  folders,
  snippets,
  parentId,
  currentFolders,
  currentSnippets,
  level = 0,
  onCreateSnippet,
  onRefresh,
  onMoveSnippet
}: FolderTreeProps) {
  const router = useRouter();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isRenameFolderOpen, setIsRenameFolderOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [isMoveSnippetOpen, setIsMoveSnippetOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<CodeFolder | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [folderName, setFolderName] = useState("");
  
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    
    try {
      const result = await createFolder(folderName, parentId);
      if (result.success) {
        setFolderName("");
        setIsCreateFolderOpen(false);
        toast.success("Folder created successfully");
        onRefresh();
      } else {
        toast.error(`Error creating folder: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };
  
  const handleRenameFolder = async () => {
    if (!selectedFolder || !folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    
    try {
      const result = await updateFolder(selectedFolder.id, folderName);
      if (result.success) {
        setFolderName("");
        setIsRenameFolderOpen(false);
        toast.success("Folder renamed successfully");
        onRefresh();
      } else {
        toast.error(`Error renaming folder: ${result.error}`);
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Failed to rename folder");
    }
  };
  
  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;
    
    try {
      const result = await deleteFolder(selectedFolder.id);
      if (result.success) {
        setIsDeleteFolderOpen(false);
        toast.success("Folder deleted successfully");
        onRefresh();
      } else {
        toast.error(`Error deleting folder: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };
  
  const handleMoveSnippet = (snippet: CodeSnippet) => {
    setSelectedSnippet(snippet);
    setIsMoveSnippetOpen(true);
  };
  
  const moveSnippet = async (snippetId: string, destinationFolderId: string | null) => {
    try {
      const result = await updateSnippet(snippetId, {
        folderId: destinationFolderId
      });
      
      if (result.success) {
        toast.success("Snippet moved successfully");
        onRefresh(); // Refresh folder contents
      } else {
        toast.error(`Error moving snippet: ${result.error || "Unknown error"}`);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error moving snippet:", error);
      toast.error("Failed to move snippet");
      throw error; // Rethrow to let the dialog handle the error
    }
  };

  // This is the entry point when level === 0
  if (level === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-medium">Files & Folders</h3>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => {
                setFolderName("");
                setIsCreateFolderOpen(true);
              }}
              title="Create new folder"
            >
              <Plus size={16} />
            </Button>
            
            <Button
              size="sm"
              variant="outline" 
              className="h-7"
              onClick={() => onCreateSnippet(parentId)}
              title="Create new snippet"
            >
              <Plus size={14} className="mr-1" />
              New Snippet
            </Button>
          </div>
        </div>
        
        {/* Display the current level folders */}
        {currentFolders.length === 0 && currentSnippets.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">
            No items here yet. Create a folder or snippet to get started.
          </div>
        ) : (
          <>
            {/* Display current folders */}
            {currentFolders.map((folder) => (
              <FolderItem 
                key={folder.id}
                folder={folder}
                isExpanded={!!expandedFolders[folder.id]}
                onToggle={() => toggleFolder(folder.id)}
                onRename={() => {
                  setSelectedFolder(folder);
                  setFolderName(folder.name);
                  setIsRenameFolderOpen(true);
                }}
                onDelete={() => {
                  setSelectedFolder(folder);
                  setIsDeleteFolderOpen(true);
                }}
                onCreateSnippet={onCreateSnippet}
              />
            ))}
            
            {/* Display current snippets */}
            {currentSnippets.map((snippet) => (
              <SnippetItem 
                key={snippet.id}
                snippet={snippet}
                onMoveSnippet={handleMoveSnippet}
              />
            ))}
          </>
        )}
        
        {/* Dialogs for folder operations */}
        <CreateFolderDialog
          isOpen={isCreateFolderOpen}
          onClose={() => setIsCreateFolderOpen(false)}
          folderName={folderName}
          onFolderNameChange={setFolderName}
          onSubmit={handleCreateFolder}
        />
        
        <RenameFolderDialog
          isOpen={isRenameFolderOpen}
          onClose={() => setIsRenameFolderOpen(false)}
          folderName={folderName}
          onFolderNameChange={setFolderName}
          onSubmit={handleRenameFolder}
        />
        
        <DeleteFolderDialog
          isOpen={isDeleteFolderOpen}
          onClose={() => setIsDeleteFolderOpen(false)}
          onConfirm={handleDeleteFolder}
          folderName={selectedFolder?.name || ""}
        />
        
        <MoveSnippetDialog
          isOpen={isMoveSnippetOpen}
          onClose={() => setIsMoveSnippetOpen(false)}
          snippet={selectedSnippet}
          folders={folders}
          onMove={moveSnippet}
        />
      </div>
    );
  }
  
  // This is for rendering nested levels
  return (
    <div className="pl-4">
      {folders.filter(folder => folder.parentId === parentId).map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          isExpanded={!!expandedFolders[folder.id]}
          onToggle={() => toggleFolder(folder.id)}
          onRename={() => {
            setSelectedFolder(folder);
            setFolderName(folder.name);
            setIsRenameFolderOpen(true);
          }}
          onDelete={() => {
            setSelectedFolder(folder);
            setIsDeleteFolderOpen(true);
          }}
          onCreateSnippet={onCreateSnippet}
        />
      ))}
      
      {snippets.filter(snippet => snippet.folderId === parentId).map((snippet) => (
        <SnippetItem 
          key={snippet.id} 
          snippet={snippet} 
          onMoveSnippet={handleMoveSnippet} 
        />
      ))}
      
      {/* Render child folders if expanded */}
      {folders
        .filter(folder => folder.parentId === parentId)
        .map(folder => expandedFolders[folder.id] && (
          <div key={`subfolder-${folder.id}`} className="pl-4">
            <FolderTree
              folders={folders}
              snippets={snippets}
              parentId={folder.id}
              currentFolders={folders.filter(f => f.parentId === folder.id)}
              currentSnippets={snippets.filter(s => s.folderId === folder.id)}
              level={level + 1}
              onCreateSnippet={onCreateSnippet}
              onRefresh={onRefresh}
            />
          </div>
        ))}
    </div>
  );
}

// Individual components for better organization

function FolderItem({ 
  folder, 
  isExpanded, 
  onToggle,
  onRename,
  onDelete,
  onCreateSnippet
}: {
  folder: CodeFolder;
  isExpanded: boolean;
  onToggle: () => void;
  onRename: () => void;
  onDelete: () => void;
  onCreateSnippet: (folderId: string | null) => void;
}) {
  return (
    <div className="mb-1">
      <div className="flex items-center group">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0"
          onClick={onToggle}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </Button>
        
        <Link 
          href={`/code-snippet/folder/${folder.id}`}
          className="flex items-center flex-1 py-1 px-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-sm"
        >
          <Folder size={16} className="mr-1.5 text-blue-500" />
          <span className="truncate">{folder.name}</span>
        </Link>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onRename}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateSnippet(folder.id)}>
                Add Snippet
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500"
                onClick={onDelete}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function SnippetItem({ snippet, onMoveSnippet }: { 
  snippet: CodeSnippet;
  onMoveSnippet: (snippet: CodeSnippet) => void;
}) {
  return (
    <div className="flex items-center pl-6 group">
      <Link
        href={`/code-snippet/${snippet.id}`}
        className="flex items-center flex-1 py-1 px-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-sm"
      >
        <File size={16} className="mr-1.5 text-gray-500" />
        <span className="truncate">{snippet.title}</span>
      </Link>
      
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onMoveSnippet(snippet)}>
              Move to Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function CreateFolderDialog({
  isOpen,
  onClose,
  folderName,
  onFolderNameChange,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  folderName: string;
  onFolderNameChange: (name: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="folderName">Folder Name</Label>
          <Input
            id="folderName"
            value={folderName}
            onChange={(e) => onFolderNameChange(e.target.value)}
            placeholder="Enter folder name"
            className="mt-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RenameFolderDialog({
  isOpen,
  onClose,
  folderName,
  onFolderNameChange,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  folderName: string;
  onFolderNameChange: (name: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="folderRename">New Folder Name</Label>
          <Input
            id="folderRename"
            value={folderName}
            onChange={(e) => onFolderNameChange(e.target.value)}
            placeholder="Enter new folder name"
            className="mt-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteFolderDialog({
  isOpen,
  onClose,
  onConfirm,
  folderName
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  folderName: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete the folder "{folderName}"? This will delete all snippets and subfolders inside this folder.
            This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// MoveSnippetDialog component
function MoveSnippetDialog({
  isOpen,
  onClose,
  snippet,
  folders,
  onMove
}: {
  isOpen: boolean;
  onClose: () => void;
  snippet: CodeSnippet | null;
  folders: CodeFolder[];
  onMove: (snippetId: string, folderId: string | null) => Promise<void>;
}) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | "root">("root");
  const [isMoving, setIsMoving] = useState(false);
  
  // Group folders by parent to build a tree structure
  const foldersByParent = useMemo(() => {
    const byParent: Record<string, CodeFolder[]> = {};
    
    // Initialize with an empty array for root folders
    byParent['root'] = [];
    
    folders.forEach(folder => {
      const parentId = folder.parentId || 'root';
      if (!byParent[parentId]) {
        byParent[parentId] = [];
      }
      byParent[parentId].push(folder);
    });
    
    return byParent;
  }, [folders]);
  
  // Reset selection when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId("root");
      setIsMoving(false);
    }
  }, [isOpen]);
  
  // Recursive function to render folder options with indentation
  const renderFolderOptions = (parentId: string | 'root', level = 0) => {
    const foldersForParent = foldersByParent[parentId] || [];
    
    return foldersForParent.map(folder => (
      <React.Fragment key={folder.id}>
        <SelectItem 
          value={folder.id} 
          // Fix the className to use a more reliable approach
          className={`pl-${level > 0 ? 4 + level * 2 : 2}`}
        >
          {level > 0 && "↳ "}{folder.name}
        </SelectItem>
        {foldersByParent[folder.id] && renderFolderOptions(folder.id, level + 1)}
      </React.Fragment>
    ));
  };
  
  const handleMove = async () => {
    if (!snippet) return;
    
    // Convert "root" to null for the database
    const targetFolderId = selectedFolderId === "root" ? null : selectedFolderId;
    
    // Don't do anything if moving to the same folder
    if (targetFolderId === snippet.folderId) {
      onClose();
      return;
    }
    
    setIsMoving(true);
    try {
      await onMove(snippet.id, targetFolderId);
      onClose();
    } catch (error) {
      console.error("Error moving snippet:", error);
      // Toast error is already shown in onMove function
    } finally {
      setIsMoving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Snippet to Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {snippet && (
            <div className="mb-4">
              <p className="text-sm font-medium">Moving: <span className="font-semibold">{snippet.title}</span></p>
              <p className="text-xs text-muted-foreground mt-1">
                Currently in: {snippet.folderId 
                  ? folders.find(f => f.id === snippet.folderId)?.name || "Unknown folder" 
                  : "Root"}
              </p>
            </div>
          )}
          
          <Label htmlFor="folderSelect">Select destination folder</Label>
          <Select 
            value={selectedFolderId} 
            onValueChange={(value) => setSelectedFolderId(value)}
          >
            <SelectTrigger id="folderSelect" className="mt-1">
              <SelectValue placeholder="Select a folder" />
            </SelectTrigger>
            <SelectContent>
              {/* Important: Use "root" as value instead of empty string */}
              <SelectItem value="root">Root (No folder)</SelectItem>
              {renderFolderOptions('root')}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isMoving}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={isMoving}>
            {isMoving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Moving...
              </>
            ) : (
              "Move Snippet"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}