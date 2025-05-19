"use client";

import React, { useState } from "react";
import { Folder, ChevronRight, ChevronDown, File, Plus, MoreVertical, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
import { 
  createFolder, 
  updateFolder, 
  deleteFolder 
} from "@/lib/actions/code-snippet.action";

interface FolderTreeProps {
  folders: CodeFolder[];
  snippets: CodeSnippet[];
  parentId: string | null;
  level?: number;
  onCreateSnippet: (folderId: string | null) => void;
  onRefresh: () => void;
  currentPath?: CodeFolder[]; // Added to track current folder path
}

export default function FolderTree({
  folders,
  snippets,
  parentId,
  level = 0,
  onCreateSnippet,
  onRefresh,
  currentPath = []
}: FolderTreeProps) {
  const router = useRouter();
  const pathname = usePathname();
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
    if (!folderName.trim()) return;
    
    const result = await createFolder(folderName, parentId);
    if (result.success) {
      setFolderName("");
      setIsCreateFolderOpen(false);
      onRefresh();
    } else {
      alert(`Error: ${result.error}`);
    }
  };
  
  const handleRenameFolder = async () => {
    if (!selectedFolder || !folderName.trim()) return;
    
    const result = await updateFolder(selectedFolder.id, folderName);
    if (result.success) {
      setFolderName("");
      setIsRenameFolderOpen(false);
      onRefresh();
    } else {
      alert(`Error: ${result.error}`);
    }
  };
  
  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;
    
    const result = await deleteFolder(selectedFolder.id);
    if (result.success) {
      setIsDeleteFolderOpen(false);
      onRefresh();
      
      // If we're currently in the deleted folder, go back to the parent
      if (pathname.includes(selectedFolder.id)) {
        const parentPath = selectedFolder.parentId 
          ? `/code-snippet/folder/${selectedFolder.parentId}`
          : "/code-snippet";
          
        router.push(parentPath);
      }
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  // Navigate to parent folder function
  const navigateToParent = () => {
    if (currentPath.length > 0) {
      const parentFolder = currentPath[currentPath.length - 2];
      const path = parentFolder 
        ? `/code-snippet/folder/${parentFolder.id}` 
        : "/code-snippet";
      router.push(path);
    } else if (parentId) {
      // Fallback if currentPath is not provided
      router.push("/code-snippet");
    }
  };

  return (
    <>
      <div className="pl-4" style={{ marginLeft: level * 12 }}>
        {level === 0 && (
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                {parentId ? "Current Location" : "My Code Snippets"}
              </h3>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setIsCreateFolderOpen(true)}
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
            
            {/* Breadcrumb navigation */}
            {parentId && (
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs flex items-center"
                  onClick={navigateToParent}
                >
                  <ArrowUp size={14} className="mr-1" />
                  Up to {currentPath.length > 1 
                    ? currentPath[currentPath.length - 2].name 
                    : "Root"}
                </Button>
              </div>
            )}
            
            {/* Current path display */}
            {currentPath.length > 0 && (
              <div className="text-xs text-muted-foreground pb-1 border-b">
                <span className="font-mono">
                  /root{currentPath.map(folder => `/${folder.name}`).join('')}
                </span>
              </div>
            )}
          </div>
        )}
        
        {folders.map((folder) => (
          <div key={folder.id} className="mb-1">
            <div className="flex items-center group">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0"
                onClick={() => toggleFolder(folder.id)}
              >
                {expandedFolders[folder.id] ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
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
                    <DropdownMenuItem onClick={() => {
                      setSelectedFolder(folder);
                      setFolderName(folder.name);
                      setIsRenameFolderOpen(true);
                    }}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCreateSnippet(folder.id)}>
                      Add Snippet
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-500"
                      onClick={() => {
                        setSelectedFolder(folder);
                        setIsDeleteFolderOpen(true);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {expandedFolders[folder.id] && (
              <FolderTree
                folders={folders.filter(f => f.parentId === folder.id)}
                snippets={snippets.filter(s => s.folderId === folder.id)}
                parentId={folder.id}
                level={level + 1}
                onCreateSnippet={onCreateSnippet}
                onRefresh={onRefresh}
                currentPath={currentPath}
              />
            )}
          </div>
        ))}
        
        {snippets.map((snippet) => (
          <div key={snippet.id} className="flex items-center pl-6 group">
            <Link
              href={`/code-snippet/${snippet.id}`}
              className="flex items-center flex-1 py-1 px-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-sm"
            >
              <File size={16} className="mr-1.5 text-gray-500" />
              <span className="truncate">{snippet.title}</span>
            </Link>
          </div>
        ))}
        
        {level === 0 && folders.length === 0 && snippets.length === 0 && (
          <div className="text-sm text-gray-500 py-2">
            No items yet. Create a folder or snippet to get started.
          </div>
        )}
      </div>
      
      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="mt-1"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rename Folder Dialog */}
      <Dialog open={isRenameFolderOpen} onOpenChange={setIsRenameFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="folderRename">New Folder Name</Label>
            <Input
              id="folderRename"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter new folder name"
              className="mt-1"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameFolder}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Folder Dialog */}
      <Dialog open={isDeleteFolderOpen} onOpenChange={setIsDeleteFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this folder? This will delete all snippets and subfolders inside this folder.
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteFolderOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}