"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImportBookmarksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

interface ImportStats {
  foldersAdded: number;
  linksAdded: number;
  linksUpdated: number;
  linksSkipped: number;
  errors: string[];
}

export const ImportBookmarksDialog = ({
  open,
  onOpenChange,
  onImportComplete,
}: ImportBookmarksDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<"skip" | "update">("skip");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState<ImportStats | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setStats(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setIsImporting(true);
    setError("");
    setStats(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("strategy", strategy);

      const response = await fetch("/api/bookmarks/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Failed to import bookmarks");
        return;
      }

      setStats(result.stats);

      // Call completion callback after a short delay to show stats
      if (onImportComplete) {
        setTimeout(() => {
          onImportComplete();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import bookmarks");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError("");
    setStats(null);
    setStrategy("skip");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Bookmarks</DialogTitle>
          <DialogDescription>
            Upload an HTML bookmark export file from your browser (Chrome, Firefox, Edge, or Safari).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!stats && (
            <>
              <div className="space-y-2">
                <Label htmlFor="file">Bookmark File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".html"
                  onChange={handleFileChange}
                  disabled={isImporting}
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Duplicate Handling</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="skip"
                      checked={strategy === "skip"}
                      onChange={(e) => setStrategy(e.target.value as "skip" | "update")}
                      disabled={isImporting}
                    />
                    <span className="text-sm">Skip duplicates</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="update"
                      checked={strategy === "update"}
                      onChange={(e) => setStrategy(e.target.value as "skip" | "update")}
                      disabled={isImporting}
                    />
                    <span className="text-sm">Update existing</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {strategy === "skip"
                    ? "Bookmarks with duplicate URLs will be skipped"
                    : "Existing bookmarks will be updated with new title and folder"}
                </p>
              </div>
            </>
          )}

          {isImporting && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Importing bookmarks...</p>
            </div>
          )}

          {stats && (
            <div className="space-y-2 p-4 bg-muted rounded-md">
              <h4 className="font-semibold text-sm">Import Complete!</h4>
              <div className="text-sm space-y-1">
                <p>Folders added: <span className="font-medium">{stats.foldersAdded}</span></p>
                <p>Bookmarks added: <span className="font-medium">{stats.linksAdded}</span></p>
                {stats.linksUpdated > 0 && (
                  <p>Bookmarks updated: <span className="font-medium">{stats.linksUpdated}</span></p>
                )}
                {stats.linksSkipped > 0 && (
                  <p>Bookmarks skipped: <span className="font-medium">{stats.linksSkipped}</span></p>
                )}
                {stats.errors.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-destructive font-medium">Errors:</p>
                    {stats.errors.map((err, i) => (
                      <p key={i} className="text-xs text-destructive">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          {!stats && (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isImporting}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!file || isImporting}>
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </>
          )}
          {stats && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
