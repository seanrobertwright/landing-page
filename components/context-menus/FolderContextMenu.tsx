"use client";

import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FolderPlus, Trash2 } from "lucide-react";

interface FolderContextMenuProps {
  children: React.ReactNode;
  folderId: string;
  folderName: string;
  onCreateSubfolder: () => void;
  onDelete: () => void;
}

export function FolderContextMenu({
  children,
  folderId,
  folderName,
  onCreateSubfolder,
  onDelete,
}: FolderContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onCreateSubfolder}>
          <FolderPlus className="mr-2 h-4 w-4" />
          <span>New Subfolder</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Folder</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
