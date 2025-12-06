"use client";

import { useCallback, useEffect, useRef } from "react";
import { useUIStore, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH } from "@/store/uiStore";

interface SidebarProps {
  children?: React.ReactNode;
}

export const Sidebar = ({ children }: SidebarProps) => {
  const { sidebarWidth, setSidebarWidth } = useUIStore();
  const sidebarRef = useRef<HTMLElement>(null);
  const isResizing = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = e.clientX;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setSidebarWidth]);

  return (
    <aside
      ref={sidebarRef}
      className="relative flex flex-col border-r border-border bg-sidebar"
      style={{ width: sidebarWidth }}
    >
      <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
        {children}
      </div>
      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent transition-colors hover:bg-primary"
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        tabIndex={0}
      />
    </aside>
  );
};
