import React from "react";
import FileExplorer from "@/components/code-snippet/FileExplorer";
import { getFolder, getFolderPath } from "@/lib/actions/code-snippet.action";
import { Button } from "@/components/ui/button";
import SnippetForm from "@/components/code-snippet/SnippetForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { folderId: string } }) {
  const { success, folder } = await getFolder(params.folderId);
  
  if (!success || !folder) {
    return {
      title: "Folder Not Found | Candid Minds",
    };
  }
  
  return {
    title: `${folder.name} | Code Snippets | Candid Minds`,
  };
}

export default async function FolderPage({ params }: { params: { folderId: string } }) {
  const { success, folder } = await getFolder(params.folderId);
  
  if (!success || !folder) {
    notFound();
  }
  
  const pathResult = await getFolderPath(params.folderId);
  const folderPath = pathResult.success ? pathResult.path : [];
  
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-2">{folder.name}</h1>
      
      {/* Breadcrumb path */}
      <div className="text-sm text-muted-foreground mb-6">
        <span className="font-mono">
          /root
          {folderPath.map((f, i) => (
            <React.Fragment key={f.id}>
              /{f.name}
            </React.Fragment>
          ))}
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Explorer */}
        <div className="lg:col-span-4">
          <FileExplorer 
            initialFolderId={params.folderId} 
            onCreateSnippet={(folderId) => {
              const url = new URL(window.location.href);
              url.pathname = "/code-snippet/new";
              url.searchParams.set("folderId", folderId || params.folderId);
              window.location.href = url.toString();
            }} 
          />
        </div>
        
        {/* Folder content */}
        <div className="lg:col-span-8">
          <div className="border rounded-md p-8 text-center flex flex-col items-center justify-center min-h-[400px] bg-background">
            <h2 className="text-xl font-medium mb-2">{folder.name}</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Use the file explorer to browse folders and snippets. Create a new snippet in this folder.
            </p>
            
            <Button 
              size="lg"
              onClick={() => {
                const url = new URL(window.location.href);
                url.pathname = "/code-snippet/new";
                url.searchParams.set("folderId", params.folderId);
                window.location.href = url.toString();
              }}
            >
              Create New Snippet Here
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}