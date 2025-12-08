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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFolderStore } from "@/store/folderStore";
import { buildFolderOptions } from "@/lib/utils/buildFolderOptions";
import { createFolderSchema } from "@/lib/validations/folder";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentFolderId?: string | null;
}

export const CreateFolderDialog = ({
  open,
  onOpenChange,
  parentFolderId,
}: CreateFolderDialogProps) => {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("ROOT");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { tree, createFolder } = useFolderStore();
  const folderOptions = buildFolderOptions(tree);

  // Update parent ID when parentFolderId prop changes and dialog opens
  if (open && parentFolderId !== undefined && parentId !== (parentFolderId || "ROOT")) {
    setParentId(parentFolderId || "ROOT");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = createFolderSchema.safeParse({
      name: name.trim(),
      parent_id: parentId === "ROOT" ? null : parentId,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      await createFolder(name.trim(), parentId === "ROOT" ? undefined : parentId);
      setName("");
      setParentId("ROOT");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setParentId("ROOT");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="create-folder-dialog">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your links.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                data-testid="folder-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter folder name"
                maxLength={255}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parent-folder">Parent Folder</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="parent-folder" data-testid="parent-folder-select">
                  <SelectValue placeholder="Select parent folder" />
                </SelectTrigger>
                <SelectContent>
                  {folderOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
