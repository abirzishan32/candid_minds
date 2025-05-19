"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteSnippet } from "@/lib/actions/code-snippet.action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface DeleteSnippetButtonProps {
  snippetId: string;
  snippetTitle: string;
}

export default function DeleteSnippetButton({ snippetId, snippetTitle }: DeleteSnippetButtonProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSnippet(snippetId);
      if (result.success) {
        toast.success("Snippet deleted successfully");
        router.push("/code-snippet");
        router.refresh();
      } else {
        toast.error(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Error: ${error}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={() => setIsDeleteDialogOpen(true)}
      >
        <Trash2 size={14} className="mr-1" />
        Delete
      </Button>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Snippet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{snippetTitle}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="mr-1 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}