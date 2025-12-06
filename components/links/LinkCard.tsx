"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Link2 } from "lucide-react";

interface LinkCardProps {
  id: string;
  title: string;
  url: string;
  onTitleChange?: (id: string, newTitle: string) => void;
}

const getFaviconUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch {
    return "";
  }
};

export const LinkCard = ({ id, title, url, onTitleChange }: LinkCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [faviconError, setFaviconError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const faviconUrl = getFaviconUrl(url);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(title);
    setIsEditing(true);
  }, [title]);

  const handleSave = useCallback(() => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== title) {
      onTitleChange?.(id, trimmedValue);
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  }, [editValue, title, id, onTitleChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditValue(title);
      setIsEditing(false);
    }
  }, [handleSave, title]);

  const handleCardClick = useCallback(() => {
    if (!isEditing) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, [isEditing, url]);

  const handleFaviconError = useCallback(() => {
    setFaviconError(true);
  }, []);

  return (
    <div
      className="group relative flex h-32 cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary hover:shadow-[0_0_20px_rgba(var(--neon-red),0.3)]"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isEditing) {
          handleCardClick();
        }
      }}
    >
      {/* Favicon */}
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-muted">
        {faviconUrl && !faviconError ? (
          <img
            src={faviconUrl}
            alt=""
            className="h-6 w-6"
            onError={handleFaviconError}
          />
        ) : (
          <Link2 className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Title */}
      <div className="flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-base font-semibold text-foreground outline-none ring-1 ring-primary"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3
            className="line-clamp-2 cursor-text text-base font-semibold text-foreground transition-colors hover:text-primary"
            onClick={handleTitleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleTitleClick(e as unknown as React.MouseEvent);
              }
            }}
          >
            {title}
          </h3>
        )}
      </div>

      {/* URL hint */}
      <p className="truncate text-xs text-muted-foreground">
        {(() => {
          try {
            return new URL(url).hostname;
          } catch {
            return url;
          }
        })()}
      </p>

      {/* Hover glow effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
};
