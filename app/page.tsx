"use client";

import { useState, useCallback, useEffect } from "react";
import { Sidebar, ContentArea } from "@/components/layout";
import { LinkCard } from "@/components/links";
import { FolderTree } from "@/components/tree/FolderTree";
import { useFolderStore } from "@/store/folderStore";
import { Link } from "@/lib/db/links";

export default function Home() {
  const selectedFolderId = useFolderStore((state) => state.selectedFolderId);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedFolderId) {
      setLinks([]);
      return;
    }

    const fetchLinks = async () => {
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
    };

    fetchLinks();
  }, [selectedFolderId]);

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
        <div className="space-y-1">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Folders
          </h2>
          <FolderTree />
        </div>
      </Sidebar>
      <ContentArea>
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
    </>
  );
}
