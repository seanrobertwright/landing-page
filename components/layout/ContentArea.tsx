"use client";

import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { ContentAreaContextMenu } from "@/components/context-menus/ContentAreaContextMenu";

interface ContentAreaProps {
  children?: React.ReactNode;
  folderName?: string;
  folderId?: string | null;
  onNewLinkClick?: () => void;
  showNewLinkButton?: boolean;
}

export const ContentArea = ({
  children,
  folderName,
  folderId,
  onNewLinkClick,
  showNewLinkButton = false,
}: ContentAreaProps) => {
  return (
    <main className="flex flex-1 flex-col overflow-auto bg-background">
      {/* Header */}
      {folderName && (
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">
            {folderName}
          </h1>
          {showNewLinkButton && (
            <Button
              onClick={onNewLinkClick}
              variant="default"
              size="sm"
              className="gap-2"
              data-testid="new-link-button"
            >
              <Link2 className="h-4 w-4" />
              New Link
            </Button>
          )}
        </div>
      )}

      {/* Content grid */}
      <ContentAreaContextMenu
        folderId={folderId || null}
        onCreateLink={() => onNewLinkClick?.()}
      >
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {children}
          </div>
        </div>
      </ContentAreaContextMenu>
    </main>
  );
};
