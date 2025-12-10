"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImportBookmarksDialog } from "@/components/dialogs/ImportBookmarksDialog";
import { useFolderStore } from "@/store/folderStore";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

export const Header = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { fetchTree } = useFolderStore();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/bookmarks/export");
      if (!response.ok) {
        throw new Error("Failed to export bookmarks");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookmarks-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Bookmarks exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export bookmarks");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportComplete = () => {
    fetchTree();
    setImportDialogOpen(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + I for Import
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        setImportDialogOpen(true);
      }
      // Ctrl/Cmd + E for Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportDialogOpen(true)}
            title="Import bookmarks (Ctrl/Cmd + I)"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
            <kbd className="ml-2 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>I
            </kbd>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            title="Export bookmarks (Ctrl/Cmd + E)"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
            {!isExporting && (
              <kbd className="ml-2 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>E
              </kbd>
            )}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">
            LRIL Landing Page
          </h1>
          <Image
            src="/hw2.jpg"
            alt="LRIL Logo"
            width={36}
            height={36}
            className="rounded-md"
            priority
          />
        </div>
      </header>

      <ImportBookmarksDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={handleImportComplete}
      />
    </>
  );
};
