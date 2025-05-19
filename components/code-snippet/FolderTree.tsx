"use client";

import React, { useState } from "react";
import { Folder, ChevronRight, ChevronDown, File, Plus, MoreVertical } from "lucide-react";
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
  deleteFolder 
} from "@/lib/actions/code-snippet.action";

interface FolderTreeProps {
  folders: CodeFolder[];
  snippets: CodeSnippet[];
  parentId: string | null;
  currentFolders: CodeFolder[];
  currentSnippets: CodeSnippet[];
  level?: number;
  onCreateSnippet: (folderId: string | null) => void;
  onRefresh: () => void;
}

export default function FolderTree({
  folders,
  snippets,
  parentId,
  currentFolders,
  currentSnippets,
  level = 0,
  onCreateSnippet,
  onRefresh
}: FolderTreeProps) {
  const router = useRouter();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isRenameFolderOpen, setIsRenameFolderOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<CodeFolder | null>(null);
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
      </div>
    );
  }
  
  // This is for rendering nested levels
  return (
    <div className="pl-4">
      {folders.map((folder) => (
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
      
      {snippets.map((snippet) => (
        <SnippetItem key={snippet.id} snippet={snippet} />
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

function SnippetItem({ snippet }: { snippet: CodeSnippet }) {
  return (
    <div className="flex items-center pl-6 group">
      <Link
        href={`/code-snippet/${snippet.id}`}
        className="flex items-center flex-1 py-1 px-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-sm"
      >
        <File size={16} className="mr-1.5 text-gray-500" />
        <span className="truncate">{snippet.title}</span>
      </Link>
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