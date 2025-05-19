import React from "react";
import { getSnippet, getFolderPath } from "@/lib/actions/code-snippet.action";
import { notFound } from "next/navigation";
import FileExplorerWrapper from "@/components/code-snippet/FileExplorerWrapper";
import CodeViewerClient from "@/components/code-snippet/CodeViewerClient"; 
import { Button } from "@/components/ui/button";
import { Pencil, ChevronLeft } from "lucide-react"; 
import Link from "next/link";
import DeleteSnippetButton from "@/components/code-snippet/DeleteSnippetButton";


export default async function SnippetPage({ params }: { params: { snippetId: string } }) {
  const { success, snippet } = await getSnippet(params.snippetId);
  
  if (!success || !snippet) {
    notFound();
  }
  

  const folderPath = snippet.folderId 
    ? (await getFolderPath(snippet.folderId)).path || [] 
    : [];
  
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Add Back Button */}
      <div className="mb-4">
        <Link href="/code-snippet">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft size={16} />
            Back to Snippets
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{snippet.title}</h1>
          
          {/* Breadcrumb path */}
          <div className="text-sm text-muted-foreground mt-1">
            <span className="font-mono">
              /root
              {folderPath.map((f) => `/${f.name}`)}
              /{snippet.title}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/code-snippet/edit/${params.snippetId}`}>
            <Button variant="outline" size="sm">
              <Pencil size={14} className="mr-1" />
              Edit
            </Button>
          </Link>
          <DeleteSnippetButton snippetId={params.snippetId} snippetTitle={snippet.title} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Snippet view */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <div className="border rounded-md p-4 bg-background">
            {/* Show description if exists */}
            {snippet.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">{snippet.description}</p>
              </div>
            )}
            
            {/* Show tags if exists */}
            {snippet.tags && snippet.tags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-1">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {snippet.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            

            {/* Code editor (readonly) - using client component wrapper */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1">Code</h3>
              <CodeViewerClient
                code={snippet.code}
                language={snippet.language}
              />
            </div>

            
            {/* Creation/update info */}
            <div className="mt-4 text-xs text-muted-foreground">
              <div>Created: {new Date(snippet.createdAt).toLocaleString()}</div>
              <div>Last updated: {new Date(snippet.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        {/* File Explorer - use wrapper component */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <FileExplorerWrapper
            initialFolderId={snippet.folderId}
            targetPath="/code-snippet/new"
          />
        </div>
      </div>
    </div>
  );
}