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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFolderStore } from "@/store/folderStore";
import { createLinkSchema } from "@/lib/validations/link";

interface CreateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  folderName: string;
  onLinkCreated?: () => void;
}

export const CreateLinkDialog = ({
  open,
  onOpenChange,
  folderId,
  folderName,
  onLinkCreated,
}: CreateLinkDialogProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createLink } = useFolderStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = createLinkSchema.safeParse({
      title: title.trim(),
      url: url.trim(),
      folder_id: folderId,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      await createLink(title.trim(), url.trim(), folderId);
      setTitle("");
      setUrl("");
      onOpenChange(false);
      onLinkCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setUrl("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="create-link-dialog">
        <DialogHeader>
          <DialogTitle>Add New Link to {folderName}</DialogTitle>
          <DialogDescription>
            Add a new link to your {folderName} folder.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-title">Link Title</Label>
              <Input
                id="link-title"
                data-testid="link-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter link title"
                maxLength={255}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                data-testid="link-url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="target-folder">Target Folder</Label>
              <Input
                id="target-folder"
                data-testid="target-folder-display"
                value={folderName}
                readOnly
                disabled
                className="bg-muted"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500" data-testid="error-message">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="create-button"
            >
              {isSubmitting ? "Adding..." : "Add Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
