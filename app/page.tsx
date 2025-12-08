"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Sidebar, ContentArea } from "@/components/layout";
import { SortableLinkCard } from "@/components/links/SortableLinkCard";
import { FolderTree } from "@/components/tree/FolderTree";
import { CreateFolderDialog } from "@/components/dialogs/CreateFolderDialog";
import { CreateLinkDialog } from "@/components/dialogs/CreateLinkDialog";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";
import { useFolderStore } from "@/store/folderStore";
import { Link } from "@/lib/db/links";
import { TreeNode } from "@/lib/db/tree";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

export default function Home() {
  const { selectedFolderId, tree, reorderLinks, fetchTree } = useFolderStore();
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string } | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<{ id: string } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

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

  const handleCreateSubfolder = useCallback((parentId: string, parentName: string) => {
    setParentFolderId(parentId);
    setIsFolderDialogOpen(true);
  }, []);

  const handleDeleteFolderRequest = useCallback((folderId: string, folderName: string) => {
    setFolderToDelete({ id: folderId, name: folderName });
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDeleteFolder = useCallback(async () => {
    if (!folderToDelete) return;

    try {
      const response = await fetch(`/api/folders/${folderToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Folder deleted successfully');
        await fetchTree();
      } else {
        toast.error('Failed to delete folder');
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast.error('Failed to delete folder. Please try again.');
    } finally {
      setFolderToDelete(null);
    }
  }, [folderToDelete, fetchTree]);

  const handleDeleteLinkRequest = useCallback((linkId: string) => {
    setLinkToDelete({ id: linkId });
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDeleteLink = useCallback(async () => {
    if (!linkToDelete) return;

    try {
      const response = await fetch(`/api/links/${linkToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Link deleted successfully');
        await fetchLinks();
      } else {
        toast.error('Failed to delete link');
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
      toast.error('Failed to delete link. Please try again.');
    } finally {
      setLinkToDelete(null);
    }
  }, [linkToDelete, fetchLinks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || !selectedFolderId) {
      return;
    }

    const oldIndex = links.findIndex((link) => link.id === active.id);
    const newIndex = links.findIndex((link) => link.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedLinks = arrayMove(links, oldIndex, newIndex);
    setLinks(reorderedLinks);

    const updatedItems = reorderedLinks.map((link, index) => ({
      id: link.id,
      folder_id: selectedFolderId,
      sort_order: (index + 1) * 100,
    }));

    try {
      await reorderLinks(updatedItems);
      toast.success('Links reordered successfully');
    } catch (error) {
      console.error('Failed to reorder links:', error);
      toast.error('Failed to reorder links. Please try again.');
      fetchLinks();
    }
  };

  const activeLink = activeId ? links.find((link) => link.id === activeId) : null;

  return (
    <>
      <Sidebar>
        <FolderTree
          onNewFolderClick={() => {
            setParentFolderId(null);
            setIsFolderDialogOpen(true);
          }}
          onCreateSubfolder={handleCreateSubfolder}
          onDeleteFolder={handleDeleteFolderRequest}
        />
      </Sidebar>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ContentArea
          folderName={selectedFolder?.name}
          folderId={selectedFolderId}
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
            <SortableContext items={links.map((link) => link.id)} strategy={rectSortingStrategy}>
              {links.map((link) => (
                <SortableLinkCard
                  key={link.id}
                  id={link.id}
                  title={link.title}
                  url={link.url}
                  onTitleChange={handleTitleChange}
                  onDelete={handleDeleteLinkRequest}
                />
              ))}
            </SortableContext>
          )}
        </ContentArea>

        <DragOverlay>
          {activeLink ? (
            <div className="bg-slate-800/90 border border-cyan-400/30 rounded-md p-4 opacity-80">
              <span className="text-sm text-slate-200">{activeLink.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateFolderDialog
        open={isFolderDialogOpen}
        onOpenChange={(open) => {
          setIsFolderDialogOpen(open);
          if (!open) setParentFolderId(null);
        }}
        parentFolderId={parentFolderId}
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

      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) {
            setFolderToDelete(null);
            setLinkToDelete(null);
          }
        }}
        title={folderToDelete ? "Delete Folder" : "Delete Link"}
        message={
          folderToDelete
            ? `Are you sure you want to delete "${folderToDelete.name}"? This will also delete all subfolders and links within it.`
            : "Are you sure you want to delete this link?"
        }
        onConfirm={folderToDelete ? handleConfirmDeleteFolder : handleConfirmDeleteLink}
      />
    </>
  );
}
