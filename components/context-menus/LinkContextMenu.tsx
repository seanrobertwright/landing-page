"use client";

import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ExternalLink, Trash2 } from "lucide-react";

interface LinkContextMenuProps {
  children: React.ReactNode;
  linkId: string;
  linkUrl: string;
  onDelete: () => void;
}

export function LinkContextMenu({
  children,
  linkId,
  linkUrl,
  onDelete,
}: LinkContextMenuProps) {
  const handleOpenInNewTab = () => {
    window.open(linkUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={handleOpenInNewTab}>
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>Open in New Tab</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Link</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
