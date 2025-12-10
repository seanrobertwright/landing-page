"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchResult, SearchResponse } from "@/lib/db/search";
import { useFolderStore } from "@/store/folderStore";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Debounce hook
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

export const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [limited, setLimited] = useState(false);

  const { selectFolder, toggleFolder, expandedFolderIds, fetchTree } =
    useFolderStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTotal(0);
      setLimited(false);
      // Auto-focus input when dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  const fetchSearchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([]);
      setTotal(0);
      setLimited(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const data: SearchResponse = await response.json();
      setResults(data.results);
      setTotal(data.total);
      setLimited(data.limited);
      setSelectedIndex(0); // Reset selection on new results
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setTotal(0);
      setLimited(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useDebounce(fetchSearchResults, 200);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.trim().length === 0) {
      setResults([]);
      setTotal(0);
      setLimited(false);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      debouncedSearch(newQuery);
    }
  };

  // Expand folder tree to show the selected folder
  const expandToFolder = useCallback(
    (folderId: string | null) => {
      if (!folderId) return;

      // Build path of folder IDs from root to target
      const findPath = (
        nodes: any[],
        targetId: string,
        path: string[] = []
      ): string[] | null => {
        for (const node of nodes) {
          if (node.id === targetId) {
            return [...path, node.id];
          }
          if (node.children && node.children.length > 0) {
            const result = findPath(node.children, targetId, [...path, node.id]);
            if (result) return result;
          }
        }
        return null;
      };

      const tree = useFolderStore.getState().tree;
      const path = findPath(tree, folderId);

      if (path) {
        // Expand all folders in the path
        path.forEach((id) => {
          if (!expandedFolderIds.has(id)) {
            toggleFolder(id);
          }
        });
      }
    },
    [expandedFolderIds, toggleFolder]
  );

  const handleSelectResult = useCallback(
    async (result: SearchResult, index: number) => {
      setSelectedIndex(index);

      // Navigate to the folder containing this item
      if (result.type === "link") {
        // For links, select the parent folder and expand tree
        await fetchTree();
        selectFolder(result.folder_id);
        expandToFolder(result.folder_id);
      } else {
        // For folders, select the folder itself and expand tree
        await fetchTree();
        selectFolder(result.id);
        expandToFolder(result.parent_id);
      }

      // Close dialog
      onOpenChange(false);
    },
    [selectFolder, expandToFolder, onOpenChange, fetchTree]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectResult(results[selectedIndex], selectedIndex);
        }
        break;
      case "Escape":
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0"
        data-testid="search-dialog"
        showCloseButton={false}
      >
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search bookmarks and folders..."
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              className="pl-10"
              data-testid="search-input"
              aria-label="Search bookmarks"
              autoComplete="off"
            />
          </div>
          {limited && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing top 50 of {total} results. Try refining your search.
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {isLoading && query.length > 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>Searching...</p>
            </div>
          ) : (
            <SearchResults
              results={results}
              query={query}
              selectedIndex={selectedIndex}
              onSelect={handleSelectResult}
            />
          )}
        </div>

        <div className="p-3 border-t bg-muted/50 text-xs text-muted-foreground flex justify-between items-center">
          <div className="flex gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">
                ↑↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">
                Enter
              </kbd>{" "}
              Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">
                Esc
              </kbd>{" "}
              Close
            </span>
          </div>
          {results.length > 0 && (
            <span>
              {results.length} result{results.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
