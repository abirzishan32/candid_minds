"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SnippetForm from "@/components/code-snippet/SnippetForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getFolderPath } from "@/lib/actions/code-snippet.action";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewSnippetPage({ folderId }: { folderId: string | null }) {
  const router = useRouter();
  const [folderPath, setFolderPath] = useState<CodeFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFolderPath = async () => {
      if (folderId) {
        const { success, path } = await getFolderPath(folderId);
        if (success) {
          setFolderPath(path);
        }
      }
      setLoading(false);
    };

    loadFolderPath();
  }, [folderId]);

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>

        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/code-snippet" className="hover:underline">Code Snippets</Link>
          {loading ? (
            <div className="flex items-center gap-1 ml-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : (
            folderPath.length > 0 && (
              <>
                <span className="mx-2">/</span>
                {folderPath.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <Link
                      href={`/code-snippet/folder/${folder.id}`}
                      className="hover:underline"
                    >
                      {folder.name}
                    </Link>
                    {index < folderPath.length - 1 && <span className="mx-2">/</span>}
                  </React.Fragment>
                ))}
              </>
            )
          )}
        </div>
      </div>

      <div className="bg-background border rounded-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Snippet</h1>
        <SnippetForm
          folderId={folderId}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

