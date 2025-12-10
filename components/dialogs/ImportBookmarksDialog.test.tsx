import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportBookmarksDialog } from './ImportBookmarksDialog';

// Mock fetch
global.fetch = vi.fn();

describe('ImportBookmarksDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <ImportBookmarksDialog
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText('Import Bookmarks')).toBeInTheDocument();
    expect(screen.getByText(/Upload an HTML bookmark export file/)).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    render(
      <ImportBookmarksDialog
        open={false}
        onOpenChange={() => {}}
      />
    );

    expect(screen.queryByText('Import Bookmarks')).not.toBeInTheDocument();
  });

  it('should have file input with correct accept attribute', () => {
    render(
      <ImportBookmarksDialog
        open={true}
        onOpenChange={() => {}}
      />
    );

    const fileInput = screen.getByLabelText('Bookmark File') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.accept).toBe('.html');
  });

  it('should have duplicate strategy radio buttons', () => {
    render(
      <ImportBookmarksDialog
        open={true}
        onOpenChange={() => {}}
      />
    );

    const skipRadio = screen.getByLabelText('Skip duplicates');
    const updateRadio = screen.getByLabelText('Update existing');

    expect(skipRadio).toBeInTheDocument();
    expect(updateRadio).toBeInTheDocument();
    expect(skipRadio).toBeChecked(); // Default should be skip
  });

  it('should have Import and Cancel buttons', () => {
    render(
      <ImportBookmarksDialog
        open={true}
        onOpenChange={() => {}}
      />
    );

    const importButton = screen.getByRole('button', { name: 'Import' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    expect(importButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it('should display selected file name and size', () => {
    render(
      <ImportBookmarksDialog
        open={true}
        onOpenChange={() => {}}
      />
    );

    const fileInput = screen.getByLabelText('Bookmark File') as HTMLInputElement;
    const file = new File(['test content'], 'bookmarks.html', { type: 'text/html' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    expect(screen.getByText(/Selected: bookmarks.html/)).toBeInTheDocument();
  });

  it('should show importing state during upload', async () => {
    (global.fetch as any).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, stats: { foldersAdded: 1, linksAdded: 1, linksUpdated: 0, linksSkipped: 0, errors: [] } })
      }), 100))
    );

    render(
      <ImportBookmarksDialog
        open={true}
        onOpenChange={() => {}}
      />
    );

    const fileInput = screen.getByLabelText('Bookmark File') as HTMLInputElement;
    const file = new File(['test'], 'bookmarks.html', { type: 'text/html' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    const importButton = screen.getByRole('button', { name: 'Import' });
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText('Importing bookmarks...')).toBeInTheDocument();
    });
  });

  it('should have Bookmark File label', () => {
    render(
      <ImportBookmarksDialog
        open={true}
        onOpenChange={() => {}}
      />
    );

    const label = screen.getByText('Bookmark File');
    expect(label).toBeInTheDocument();
  });

  it('should display error message on failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Invalid bookmark file format'
      })
    });

    render(
      <ImportBookmarksDialog
        open={true}
        onOpenChange={() => {}}
      />
    );

    const fileInput = screen.getByLabelText('Bookmark File') as HTMLInputElement;
    const file = new File(['test'], 'bookmarks.html', { type: 'text/html' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    const importButton = screen.getByRole('button', { name: 'Import' });
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid bookmark file format')).toBeInTheDocument();
    });
  });

  it('should display duplicate handling label', () => {
    render(
      <ImportBookmarksDialog
        open={true}
        onOpenChange={() => {}}
      />
    );

    const label = screen.getByText('Duplicate Handling');
    expect(label).toBeInTheDocument();
  });

  it('should allow changing duplicate strategy', () => {
    render(
      <ImportBookmarksDialog
        open={true}
        onOpenChange={() => {}}
      />
    );

    const updateRadio = screen.getByLabelText('Update existing');
    fireEvent.click(updateRadio);

    expect(updateRadio).toBeChecked();
    expect(screen.getByText(/Existing bookmarks will be updated/)).toBeInTheDocument();
  });
});
