import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchResults } from './SearchResults';
import { SearchResult } from '@/lib/db/search';

describe('SearchResults', () => {
  const mockOnSelect = vi.fn();

  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'link',
      title: 'GitHub',
      url: 'https://github.com',
      folder_id: 'folder-1',
      favicon_url: null,
      sort_order: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      score: 100,
      folder_path: ['Work', 'Projects'],
    },
    {
      id: '2',
      type: 'folder',
      name: 'GitHub Projects',
      parent_id: 'folder-1',
      sort_order: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      score: 50,
      folder_path: ['Work'],
    },
  ];

  it('should render no results message when results are empty', () => {
    render(
      <SearchResults
        results={[]}
        query="test"
        selectedIndex={0}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('Try a different search term')).toBeInTheDocument();
  });

  it('should render search results', () => {
    render(
      <SearchResults
        results={mockResults}
        query="git"
        selectedIndex={0}
        onSelect={mockOnSelect}
      />
    );

    // Check that result containers exist
    expect(screen.getByTestId('search-result-0')).toBeInTheDocument();
    expect(screen.getByTestId('search-result-1')).toBeInTheDocument();
  });

  it('should call onSelect when result is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SearchResults
        results={mockResults}
        query="git"
        selectedIndex={0}
        onSelect={mockOnSelect}
      />
    );

    const firstResult = screen.getByTestId('search-result-0');
    await user.click(firstResult);

    expect(mockOnSelect).toHaveBeenCalledWith(mockResults[0], 0);
  });

  it('should highlight selected result', () => {
    render(
      <SearchResults
        results={mockResults}
        query="git"
        selectedIndex={1}
        onSelect={mockOnSelect}
      />
    );

    const secondResult = screen.getByTestId('search-result-1');
    expect(secondResult).toHaveClass('bg-accent');
  });

  it('should display folder path', () => {
    render(
      <SearchResults
        results={mockResults}
        query="git"
        selectedIndex={0}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Work > Projects')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('should show Root for empty folder path', () => {
    const resultsWithEmptyPath: SearchResult[] = [
      {
        ...mockResults[0],
        folder_path: [],
      },
    ];

    render(
      <SearchResults
        results={resultsWithEmptyPath}
        query="git"
        selectedIndex={0}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Root')).toBeInTheDocument();
  });

  it('should render folder icon for folder results', () => {
    render(
      <SearchResults
        results={[mockResults[1]]}
        query="git"
        selectedIndex={0}
        onSelect={mockOnSelect}
      />
    );

    const result = screen.getByTestId('search-result-0');
    expect(result).toBeInTheDocument();
  });

  it('should render link icon for link results', () => {
    render(
      <SearchResults
        results={[mockResults[0]]}
        query="git"
        selectedIndex={0}
        onSelect={mockOnSelect}
      />
    );

    const result = screen.getByTestId('search-result-0');
    expect(result).toBeInTheDocument();
  });
});
