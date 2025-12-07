import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TreeNode } from './TreeNode';
import { useFolderStore } from '@/store/folderStore';
import { TreeNode as TreeNodeType } from '@/lib/db/tree';

vi.mock('@/store/folderStore', () => ({
  useFolderStore: vi.fn(),
}));

describe('TreeNode component', () => {
  const mockToggleFolder = vi.fn();
  const mockSelectFolder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useFolderStore as any).mockReturnValue({
      expandedFolderIds: new Set<string>(),
      selectedFolderId: null,
      toggleFolder: mockToggleFolder,
      selectFolder: mockSelectFolder,
    });
  });

  describe('folder node', () => {
    const folderNode: TreeNodeType = {
      id: 'folder-1',
      type: 'folder',
      name: 'Test Folder',
      children: [],
    };

    it('should render folder with name', () => {
      render(<TreeNode node={folderNode} />);

      expect(screen.getByText('Test Folder')).toBeInTheDocument();
    });

    it('should render chevron icon for folders', () => {
      render(<TreeNode node={folderNode} />);

      const chevron = screen.getByTestId('chevron-folder-1');
      expect(chevron).toBeInTheDocument();
    });

    it('should call toggleFolder and selectFolder when folder clicked', async () => {
      const user = userEvent.setup();
      render(<TreeNode node={folderNode} />);

      const node = screen.getByTestId('tree-node-folder-1');
      await user.click(node);

      expect(mockToggleFolder).toHaveBeenCalledWith('folder-1');
      expect(mockSelectFolder).toHaveBeenCalledWith('folder-1');
    });

    it('should not rotate chevron when folder is collapsed', () => {
      render(<TreeNode node={folderNode} />);

      const chevron = screen.getByTestId('chevron-folder-1');
      expect(chevron).not.toHaveClass('rotate-90');
    });

    it('should rotate chevron when folder is expanded', () => {
      (useFolderStore as any).mockReturnValue({
        expandedFolderIds: new Set(['folder-1']),
        selectedFolderId: null,
        toggleFolder: mockToggleFolder,
        selectFolder: mockSelectFolder,
      });

      render(<TreeNode node={folderNode} />);

      const chevron = screen.getByTestId('chevron-folder-1');
      expect(chevron).toHaveClass('rotate-90');
    });

    it('should highlight when selected', () => {
      (useFolderStore as any).mockReturnValue({
        expandedFolderIds: new Set(),
        selectedFolderId: 'folder-1',
        toggleFolder: mockToggleFolder,
        selectFolder: mockSelectFolder,
      });

      render(<TreeNode node={folderNode} />);

      const node = screen.getByTestId('tree-node-folder-1');
      expect(node).toHaveClass('bg-slate-800/70');
    });

    it('should not highlight when not selected', () => {
      render(<TreeNode node={folderNode} />);

      const node = screen.getByTestId('tree-node-folder-1');
      expect(node).not.toHaveClass('bg-slate-800/70');
    });

    it('should render children when expanded', () => {
      const folderWithChildren: TreeNodeType = {
        id: 'folder-1',
        type: 'folder',
        name: 'Parent',
        children: [
          { id: 'child-1', type: 'folder', name: 'Child 1', children: [] },
          { id: 'child-2', type: 'folder', name: 'Child 2', children: [] },
        ],
      };

      (useFolderStore as any).mockReturnValue({
        expandedFolderIds: new Set(['folder-1']),
        selectedFolderId: null,
        toggleFolder: mockToggleFolder,
        selectFolder: mockSelectFolder,
      });

      render(<TreeNode node={folderWithChildren} />);

      expect(screen.getByText('Parent')).toBeInTheDocument();
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('should not render children when collapsed', () => {
      const folderWithChildren: TreeNodeType = {
        id: 'folder-1',
        type: 'folder',
        name: 'Parent',
        children: [
          { id: 'child-1', type: 'folder', name: 'Child 1', children: [] },
        ],
      };

      render(<TreeNode node={folderWithChildren} />);

      expect(screen.getByText('Parent')).toBeInTheDocument();
      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    });

    it('should apply correct indentation based on depth', () => {
      const { container } = render(<TreeNode node={folderNode} depth={2} />);

      const nodeElement = screen.getByTestId('tree-node-folder-1');
      expect(nodeElement).toHaveStyle({ paddingLeft: '44px' }); // 2 * 16 + 12 = 44
    });

    it('should apply default indentation when depth is 0', () => {
      const { container } = render(<TreeNode node={folderNode} depth={0} />);

      const nodeElement = screen.getByTestId('tree-node-folder-1');
      expect(nodeElement).toHaveStyle({ paddingLeft: '12px' });
    });
  });

  describe('link node', () => {
    const linkNode: TreeNodeType = {
      id: 'link-1',
      type: 'link',
      name: 'Test Link',
      url: 'https://example.com',
    };

    it('should render link with name', () => {
      render(<TreeNode node={linkNode} />);

      expect(screen.getByText('Test Link')).toBeInTheDocument();
    });

    it('should not render chevron for links', () => {
      render(<TreeNode node={linkNode} />);

      expect(screen.queryByTestId('chevron-link-1')).not.toBeInTheDocument();
    });

    it('should not highlight links when selected folder matches', () => {
      (useFolderStore as any).mockReturnValue({
        expandedFolderIds: new Set(),
        selectedFolderId: 'link-1',
        toggleFolder: mockToggleFolder,
        selectFolder: mockSelectFolder,
      });

      render(<TreeNode node={linkNode} />);

      const node = screen.getByTestId('tree-node-link-1');
      expect(node).not.toHaveClass('bg-slate-800/70');
    });

    it('should open link in new tab when clicked', async () => {
      const user = userEvent.setup();
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(<TreeNode node={linkNode} />);

      const node = screen.getByTestId('tree-node-link-1');
      await user.click(node);

      expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
      expect(mockToggleFolder).not.toHaveBeenCalled();
      expect(mockSelectFolder).not.toHaveBeenCalled();

      windowOpenSpy.mockRestore();
    });

    it('should not open window if url is missing', async () => {
      const user = userEvent.setup();
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      const linkWithoutUrl: TreeNodeType = {
        id: 'link-1',
        type: 'link',
        name: 'Test Link',
      };

      render(<TreeNode node={linkWithoutUrl} />);

      const node = screen.getByTestId('tree-node-link-1');
      await user.click(node);

      expect(windowOpenSpy).not.toHaveBeenCalled();

      windowOpenSpy.mockRestore();
    });
  });

  describe('nested folders', () => {
    it('should render deeply nested structure correctly', () => {
      const deeplyNested: TreeNodeType = {
        id: 'level-1',
        type: 'folder',
        name: 'Level 1',
        children: [
          {
            id: 'level-2',
            type: 'folder',
            name: 'Level 2',
            children: [
              {
                id: 'level-3',
                type: 'folder',
                name: 'Level 3',
                children: [],
              },
            ],
          },
        ],
      };

      (useFolderStore as any).mockReturnValue({
        expandedFolderIds: new Set(['level-1', 'level-2']),
        selectedFolderId: null,
        toggleFolder: mockToggleFolder,
        selectFolder: mockSelectFolder,
      });

      render(<TreeNode node={deeplyNested} />);

      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
      expect(screen.getByText('Level 3')).toBeInTheDocument();
    });
  });
});
