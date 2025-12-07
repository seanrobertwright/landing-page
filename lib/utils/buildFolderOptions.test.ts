import { describe, it, expect } from "vitest";
import { buildFolderOptions } from "./buildFolderOptions";
import { TreeNode } from "@/lib/db/tree";

describe("buildFolderOptions", () => {
  it("should include root option as first item", () => {
    const tree: TreeNode[] = [];
    const options = buildFolderOptions(tree);

    expect(options[0]).toEqual({ id: "ROOT", label: "(Root)", depth: 0 });
  });

  it("should flatten folders with proper indentation", () => {
    const tree: TreeNode[] = [
      {
        id: "folder-1",
        type: "folder",
        name: "Bookmarks",
        children: [],
      },
      {
        id: "folder-2",
        type: "folder",
        name: "Development",
        children: [],
      },
    ];

    const options = buildFolderOptions(tree);

    expect(options).toHaveLength(3); // Root + 2 folders
    expect(options[1]).toEqual({ id: "folder-1", label: "Bookmarks", depth: 0 });
    expect(options[2]).toEqual({ id: "folder-2", label: "Development", depth: 0 });
  });

  it("should handle nested folders with indentation", () => {
    const tree: TreeNode[] = [
      {
        id: "folder-1",
        type: "folder",
        name: "Development",
        children: [
          {
            id: "folder-2",
            type: "folder",
            name: "Frontend",
            children: [],
          },
          {
            id: "folder-3",
            type: "folder",
            name: "Backend",
            children: [],
          },
        ],
      },
    ];

    const options = buildFolderOptions(tree);

    expect(options).toHaveLength(4);
    expect(options[1]).toEqual({ id: "folder-1", label: "Development", depth: 0 });
    expect(options[2]).toEqual({ id: "folder-2", label: "  └─ Frontend", depth: 1 });
    expect(options[3]).toEqual({ id: "folder-3", label: "  └─ Backend", depth: 1 });
  });

  it("should filter out links and only include folders", () => {
    const tree: TreeNode[] = [
      {
        id: "folder-1",
        type: "folder",
        name: "Bookmarks",
        children: [
          {
            id: "link-1",
            type: "link",
            name: "Example Link",
            url: "https://example.com",
          },
          {
            id: "folder-2",
            type: "folder",
            name: "SubFolder",
            children: [],
          },
        ],
      },
    ];

    const options = buildFolderOptions(tree);

    expect(options).toHaveLength(3); // Root + 2 folders (link excluded)
    expect(options[1]).toEqual({ id: "folder-1", label: "Bookmarks", depth: 0 });
    expect(options[2]).toEqual({ id: "folder-2", label: "  └─ SubFolder", depth: 1 });
  });

  it("should handle deeply nested folders", () => {
    const tree: TreeNode[] = [
      {
        id: "folder-1",
        type: "folder",
        name: "Level 1",
        children: [
          {
            id: "folder-2",
            type: "folder",
            name: "Level 2",
            children: [
              {
                id: "folder-3",
                type: "folder",
                name: "Level 3",
                children: [],
              },
            ],
          },
        ],
      },
    ];

    const options = buildFolderOptions(tree);

    expect(options).toHaveLength(4);
    expect(options[1]).toEqual({ id: "folder-1", label: "Level 1", depth: 0 });
    expect(options[2]).toEqual({ id: "folder-2", label: "  └─ Level 2", depth: 1 });
    expect(options[3]).toEqual({ id: "folder-3", label: "    └─ Level 3", depth: 2 });
  });
});
