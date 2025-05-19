"use client";

import React from "react";
import FileExplorer from "./FileExplorer";
import { useRouter } from "next/navigation";

interface FileExplorerWrapperProps {
  initialFolderId: string | null;
  targetPath: string; // Path to navigate to when creating a snippet
}

export default function FileExplorerWrapper({ 
  initialFolderId,
  targetPath
}: FileExplorerWrapperProps) {
  const router = useRouter();
  
  const handleCreateSnippet = (folderId: string | null) => {
    // Use router.push instead of direct URL manipulation for better integration with Next.js
    if (folderId) {
      router.push(`${targetPath}?folderId=${folderId}`);
    } else {
      router.push(targetPath);
    }
  };
  
  return (
    <FileExplorer 
      initialFolderId={initialFolderId}
      onCreateSnippet={handleCreateSnippet}
    />
  );
}