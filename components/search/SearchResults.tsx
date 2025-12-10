"use client";

import { SearchResult } from "@/lib/db/search";
import { highlightMatches } from "@/lib/search/highlight";
import { Folder, Link } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  selectedIndex: number;
  onSelect: (result: SearchResult, index: number) => void;
}

export const SearchResults = ({
  results,
  query,
  selectedIndex,
  onSelect,
}: SearchResultsProps) => {
  if (results.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>No results found</p>
        <p className="text-sm mt-2">Try a different search term</p>
      </div>
    );
  }

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="space-y-1" role="listbox" aria-label="Search results">
      {results.map((result, index) => {
        const isSelected = index === selectedIndex;
        const isFolder = result.type === "folder";

        const titleSegments = highlightMatches(
          isFolder ? result.name : result.title,
          query
        );
        const urlSegments = !isFolder
          ? highlightMatches(result.url, query)
          : null;

        const folderPath =
          result.folder_path.length > 0
            ? result.folder_path.join(" > ")
            : "Root";

        return (
          <div
            key={result.id}
            role="option"
            aria-selected={isSelected}
            className={cn(
              "px-4 py-3 rounded-md cursor-pointer transition-colors",
              "hover:bg-accent",
              isSelected && "bg-accent"
            )}
            onClick={() => onSelect(result, index)}
            data-testid={`search-result-${index}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 text-muted-foreground">
                {isFolder ? (
                  <Folder className="w-4 h-4" />
                ) : (
                  <Link className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {titleSegments.map((segment, i) => (
                    <span
                      key={i}
                      className={cn(
                        segment.highlight &&
                          "bg-yellow-200 dark:bg-yellow-900 font-bold"
                      )}
                    >
                      {segment.text}
                    </span>
                  ))}
                </div>
                {urlSegments && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {urlSegments.map((segment, i) => (
                      <span
                        key={i}
                        className={cn(
                          segment.highlight &&
                            "bg-yellow-200 dark:bg-yellow-900 font-bold"
                        )}
                      >
                        {truncate(segment.text, 60)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {truncate(folderPath, 50)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
