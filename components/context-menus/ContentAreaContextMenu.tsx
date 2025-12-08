"use client";

import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Plus } from "lucide-react";

interface ContentAreaContextMenuProps {
  children: React.ReactNode;
  folderId: string | null;
  onCreateLink: () => void;
}

export function ContentAreaContextMenu({
  children,
  folderId,
  onCreateLink,
}: ContentAreaContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onCreateLink}>
          <Plus className="mr-2 h-4 w-4" />
          <span>New Link</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
