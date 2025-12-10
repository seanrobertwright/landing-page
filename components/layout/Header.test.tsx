import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Header } from './Header';

// Mock fetch
global.fetch = vi.fn();

// Mock useFolderStore
vi.mock('@/store/folderStore', () => ({
  useFolderStore: () => ({
    fetchTree: vi.fn(),
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header with title and logo', () => {
    render(<Header />);

    expect(screen.getByText('LRIL Landing Page')).toBeInTheDocument();
    expect(screen.getByAltText('LRIL Logo')).toBeInTheDocument();
  });

  it('should render Import button', () => {
    render(<Header />);

    const importButton = screen.getByRole('button', { name: /import/i });
    expect(importButton).toBeInTheDocument();
  });

  it('should render Export button', () => {
    render(<Header />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('should open import dialog when Import button is clicked', () => {
    render(<Header />);

    const importButton = screen.getByRole('button', { name: /import/i });
    fireEvent.click(importButton);

    expect(screen.getByText('Import Bookmarks')).toBeInTheDocument();
  });

  it('should trigger export when Export button is clicked', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/json' });
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    });

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    render(<Header />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/bookmarks/export');
    });

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    });
  });

  it('should disable Export button while exporting', async () => {
    (global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                blob: async () => new Blob(['test'], { type: 'application/json' }),
              }),
            100
          )
        )
    );

    render(<Header />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(exportButton).toHaveTextContent('Exporting...');
      expect(exportButton).toBeDisabled();
    });
  });

  it('should show error toast on export failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(<Header />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/bookmarks/export');
    });
  });

  it('should call export API with correct endpoint', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/json' });
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    });

    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    render(<Header />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/bookmarks/export');
    });
  });
});
