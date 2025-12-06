"use client";

import { useState, useCallback } from "react";
import { Sidebar, ContentArea } from "@/components/layout";
import { LinkCard } from "@/components/links";
import { Folder, ChevronRight } from "lucide-react";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

const initialLinks: LinkItem[] = [
  { id: "1", title: "GitHub", url: "https://github.com" },
  { id: "2", title: "Stack Overflow", url: "https://stackoverflow.com" },
  { id: "3", title: "MDN Web Docs", url: "https://developer.mozilla.org" },
  { id: "4", title: "TypeScript Docs", url: "https://www.typescriptlang.org" },
  { id: "5", title: "Next.js Documentation", url: "https://nextjs.org/docs" },
  { id: "6", title: "Tailwind CSS", url: "https://tailwindcss.com" },
  { id: "7", title: "React Documentation", url: "https://react.dev" },
  { id: "8", title: "Vercel", url: "https://vercel.com" },
];

export default function Home() {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);

  const handleTitleChange = useCallback((id: string, newTitle: string) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, title: newTitle } : link))
    );
  }, []);

  return (
    <>
      <Sidebar>
        <div className="space-y-1">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Folders
          </h2>
          {/* Placeholder folder tree */}
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Folder className="h-4 w-4 text-primary" />
            <span className="whitespace-nowrap">Development Resources</span>
          </div>
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Folder className="h-4 w-4 text-secondary" />
            <span className="whitespace-nowrap">Design Inspiration</span>
          </div>
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Folder className="h-4 w-4 text-accent" />
            <span className="whitespace-nowrap">Very Long Folder Name That Should Cause Horizontal Scrolling</span>
          </div>
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Folder className="h-4 w-4 text-neon-cyan" />
            <span className="whitespace-nowrap">Tools & Utilities</span>
          </div>
        </div>
      </Sidebar>
      <ContentArea>
        {links.map((link) => (
          <LinkCard
            key={link.id}
            id={link.id}
            title={link.title}
            url={link.url}
            onTitleChange={handleTitleChange}
          />
        ))}
      </ContentArea>
    </>
  );
}
