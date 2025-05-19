"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from '@/lib/actions/auth.action';
import { FieldValue } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

// Define interfaces for type safety
interface CodeSnippet {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  tags?: string[];
  folderId: string | null; // null means root level
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
  userId: string;
}

interface CodeFolder {
  id: string;
  name: string;
  parentId: string | null; // null means root level
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
  userId: string;
}

// Helper function to serialize Firestore data (converting timestamps to ISO strings)
const serializeFirestoreData = (data: any) => {
  if (!data) return null;
  
  const serialized: any = { ...data };
  
  // Convert Firestore Timestamps to ISO strings
  if (data.createdAt && typeof data.createdAt.toDate === 'function') {
    serialized.createdAt = data.createdAt.toDate().toISOString();
  }
  if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
    serialized.updatedAt = data.updatedAt.toDate().toISOString();
  }
  
  return serialized;
};

// Snippet CRUD operations
export async function createSnippet(data: {
  title: string;
  description?: string;
  code: string;
  language: string;
  tags?: string[];
  folderId: string | null;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }
    
    const snippetId = uuidv4();
    const now = FieldValue.serverTimestamp();
    
    const snippetData: CodeSnippet = {
      id: snippetId,
      ...data,
      userId: currentUser.id,
      createdAt: now,
      updatedAt: now
    };
    
    await db.collection("codeSnippets").doc(snippetId).set(snippetData);
    
    revalidatePath('/code-snippet');
    if (data.folderId) {
      revalidatePath(`/code-snippet/folder/${data.folderId}`);
    }
    
    return { 
      success: true, 
      snippet: {
        ...snippetData,
        id: snippetId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Error creating snippet:", error);
    return { success: false, error: "Failed to create snippet" };
  }
}

export async function updateSnippet(id: string, data: Partial<Omit<CodeSnippet, "id" | "userId" | "createdAt">>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Check if snippet belongs to user
    const snippetRef = db.collection("codeSnippets").doc(id);
    const snippetSnap = await snippetRef.get();
    
    if (!snippetSnap.exists) {
      return { success: false, error: "Snippet not found" };
    }
    
    const snippet = snippetSnap.data() as CodeSnippet;
    if (snippet.userId !== currentUser.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Update snippet
    const updateData = {
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    };
    
    await snippetRef.update(updateData);
    
    revalidatePath(`/code-snippet/${id}`);
    if (snippet.folderId) {
      revalidatePath(`/code-snippet/folder/${snippet.folderId}`);
    }
    revalidatePath('/code-snippet');
    
    return { success: true };
  } catch (error) {
    console.error("Error updating snippet:", error);
    return { success: false, error: "Failed to update snippet" };
  }
}

export async function deleteSnippet(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Check if snippet belongs to user
    const snippetRef = db.collection("codeSnippets").doc(id);
    const snippetSnap = await snippetRef.get();
    
    if (!snippetSnap.exists) {
      return { success: false, error: "Snippet not found" };
    }
    
    const snippet = snippetSnap.data() as CodeSnippet;
    if (snippet.userId !== currentUser.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Delete snippet
    await snippetRef.delete();
    
    revalidatePath('/code-snippet');
    if (snippet.folderId) {
      revalidatePath(`/code-snippet/folder/${snippet.folderId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting snippet:", error);
    return { success: false, error: "Failed to delete snippet" };
  }
}

export async function getSnippet(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }
    
    const snippetRef = db.collection("codeSnippets").doc(id);
    const snippetSnap = await snippetRef.get();
    
    if (!snippetSnap.exists) {
      return { success: false, error: "Snippet not found" };
    }
    
    const snippetData = snippetSnap.data() as CodeSnippet;
    if (snippetData.userId !== currentUser.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    return { 
      success: true, 
      snippet: serializeFirestoreData(snippetData)
    };
  } catch (error) {
    console.error("Error getting snippet:", error);
    return { success: false, error: "Failed to get snippet" };
  }
}

export async function getSnippetsByFolder(folderId: string | null) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized", snippets: [] };
    }
    
    let snippetsQuery = db.collection("codeSnippets")
      .where("userId", "==", currentUser.id);
    
    // Add the folderId condition
    snippetsQuery = snippetsQuery.where("folderId", "==", folderId);
    
    const snippetsSnapshot = await snippetsQuery.orderBy("updatedAt", "desc").get();
    
    const snippets = snippetsSnapshot.docs.map(doc => {
      const data = doc.data() || {};
      return serializeFirestoreData(data) as CodeSnippet;
    });
    
    return { success: true, snippets };
  } catch (error) {
    console.error("Error getting snippets:", error);
    return { success: false, error: "Failed to get snippets", snippets: [] };
  }
}

// Folder CRUD operations
export async function createFolder(name: string, parentId: string | null) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }
    
    const folderId = uuidv4();
    const now = FieldValue.serverTimestamp();
    
    const folderData: CodeFolder = {
      id: folderId,
      name,
      parentId,
      userId: currentUser.id,
      createdAt: now,
      updatedAt: now
    };
    
    await db.collection("codeFolders").doc(folderId).set(folderData);
    
    revalidatePath('/code-snippet');
    if (parentId) {
      revalidatePath(`/code-snippet/folder/${parentId}`);
    }
    
    return { 
      success: true, 
      folder: {
        ...folderData,
        id: folderId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Error creating folder:", error);
    return { success: false, error: "Failed to create folder" };
  }
}

export async function updateFolder(id: string, name: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Check if folder belongs to user
    const folderRef = db.collection("codeFolders").doc(id);
    const folderSnap = await folderRef.get();
    
    if (!folderSnap.exists) {
      return { success: false, error: "Folder not found" };
    }
    const folder = folderSnap.data() as CodeFolder;
    if (folder.userId !== currentUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Update folder
    await folderRef.update({
      name,
      updatedAt: FieldValue.serverTimestamp()
    });
    
    revalidatePath(`/code-snippet/folder/${id}`);
    if (folder.parentId) {
      revalidatePath(`/code-snippet/folder/${folder.parentId}`);
    } else {
      revalidatePath('/code-snippet');
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating folder:", error);
    return { success: false, error: "Failed to update folder" };
  }
}

export async function deleteFolder(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Check if folder belongs to user
    const folderRef = db.collection("codeFolders").doc(id);
    const folderSnap = await folderRef.get();
    
    if (!folderSnap.exists) {
      return { success: false, error: "Folder not found" };
    }
    const folder = folderSnap.data() as CodeFolder;
    if (folder.userId !== currentUser.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Get all subfolders
    const subFoldersSnapshot = await db.collection("codeFolders")
      .where("userId", "==", currentUser.id)
      .where("parentId", "==", id)
      .get();
    
    const subFolderIds: string[] = [];
    subFoldersSnapshot.forEach(doc => {
      subFolderIds.push(doc.id);
    });
    
    // Get all snippets in this folder
    const snippetsSnapshot = await db.collection("codeSnippets")
      .where("userId", "==", currentUser.id)
      .where("folderId", "==", id)
      .get();
    
    // Delete all snippets in this folder
    const deleteSnippetPromises = snippetsSnapshot.docs.map(doc => doc.ref.delete());
    
    // Delete all subfolders recursively
    const deleteSubFolderPromises = subFolderIds.map(folderId => deleteFolder(folderId));
    
    await Promise.all([...deleteSnippetPromises, ...deleteSubFolderPromises]);
    
    // Delete the folder itself
    await folderRef.delete();
    
    if (folder.parentId) {
      revalidatePath(`/code-snippet/folder/${folder.parentId}`);
    }
    revalidatePath('/code-snippet');
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting folder:", error);
    return { success: false, error: "Failed to delete folder" };
  }
}

export async function getFoldersByParent(parentId: string | null) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized", folders: [] };
    }
    
    let foldersQuery = db.collection("codeFolders")
      .where("userId", "==", currentUser.id);
      
    // Add the parentId condition
    foldersQuery = foldersQuery.where("parentId", "==", parentId);
    
    const foldersSnapshot = await foldersQuery.orderBy("name").get();
    
    const folders = foldersSnapshot.docs.map(doc => {
      const data = doc.data() || {};
      return serializeFirestoreData(data) as CodeFolder;
    });
    
    return { success: true, folders };
  } catch (error) {
    console.error("Error getting folders:", error);
    return { success: false, error: "Failed to get folders", folders: [] };
  }
}

export async function getFolder(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }
    
    const folderRef = db.collection("codeFolders").doc(id);
    const folderSnap = await folderRef.get();
    
    if (!folderSnap.exists) {
      return { success: false, error: "Folder not found" };
    }
    const folderData = folderSnap.data() as CodeFolder;
    if (folderData.userId !== currentUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    return { 
      success: true, 
      folder: serializeFirestoreData(folderData) 
    };
  } catch (error) {
    console.error("Error getting folder:", error);
    return { success: false, error: "Failed to get folder" };
  }
}

// Get folder breadcrumb path
export async function getFolderPath(folderId: string | null) {
  if (!folderId) {
    return { success: true, path: [] };
  }

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized", path: [] };
    }
    
    const path: CodeFolder[] = [];
    let currentFolderId = folderId;
    
    while (currentFolderId) {
      const { success, folder, error } = await getFolder(currentFolderId);
      
      if (!success || !folder) {
        return { success: false, error, path };
      }
      
      path.unshift(folder);
      currentFolderId = folder.parentId;
    }
    
    return { success: true, path };
  } catch (error) {
    console.error("Error getting folder path:", error);
    return { success: false, error: "Failed to get folder path", path: [] };
  }
}