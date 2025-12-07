"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Sidebar, ContentArea } from "@/components/layout";
import { LinkCard } from "@/components/links";
import { FolderTree } from "@/components/tree/FolderTree";
import { CreateFolderDialog } from "@/components/dialogs/CreateFolderDialog";
import { CreateLinkDialog } from "@/components/dialogs/CreateLinkDialog";
import { useFolderStore } from "@/store/folderStore";
import { Link } from "@/lib/db/links";
import { TreeNode } from "@/lib/db/tree";

export default function Home() {
  const { selectedFolderId, tree } = useFolderStore();
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  const selectedFolder = useMemo(() => {
    const findFolder = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.type === 'folder' && node.id === selectedFolderId) {
          return node;
        }
        if (node.children) {
          const found = findFolder(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return selectedFolderId ? findFolder(tree) : null;
  }, [tree, selectedFolderId]);

  const fetchLinks = useCallback(async () => {
    if (!selectedFolderId) {
      setLinks([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/links');
      if (response.ok) {
        const allLinks: Link[] = await response.json();
        const filteredLinks = allLinks.filter(link => link.folder_id === selectedFolderId);
        setLinks(filteredLinks);
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFolderId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleTitleChange = useCallback(async (id: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        setLinks((prev) =>
          prev.map((link) => (link.id === id ? { ...link, title: newTitle } : link))
        );
      }
    } catch (error) {
      console.error('Failed to update link title:', error);
    }
  }, []);

  return (
    <>
      <Sidebar>
        <FolderTree onNewFolderClick={() => setIsFolderDialogOpen(true)} />
      </Sidebar>
      <ContentArea
        folderName={selectedFolder?.name}
        onNewLinkClick={() => setIsLinkDialogOpen(true)}
        showNewLinkButton={!!selectedFolderId}
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-slate-400">
            Loading links...
          </div>
        ) : links.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-slate-400">
            No links in this folder
          </div>
        ) : (
          links.map((link) => (
            <LinkCard
              key={link.id}
              id={link.id}
              title={link.title}
              url={link.url}
              onTitleChange={handleTitleChange}
            />
          ))
        )}
      </ContentArea>

      <CreateFolderDialog
        open={isFolderDialogOpen}
        onOpenChange={setIsFolderDialogOpen}
      />

      {selectedFolder && (
        <CreateLinkDialog
          open={isLinkDialogOpen}
          onOpenChange={setIsLinkDialogOpen}
          folderId={selectedFolder.id}
          folderName={selectedFolder.name}
          onLinkCreated={fetchLinks}
        />
      )}
    </>
  );
}
