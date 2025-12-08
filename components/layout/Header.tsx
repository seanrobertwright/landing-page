"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImportBookmarksDialog } from "@/components/dialogs/ImportBookmarksDialog";
import { useFolderStore } from "@/store/folderStore";
import { Download, Upload } from "lucide-react";

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
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export bookmarks");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportComplete = () => {
    fetchTree();
    setImportDialogOpen(false);
  };

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
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
