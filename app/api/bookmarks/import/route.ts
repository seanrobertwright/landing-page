import { NextRequest, NextResponse } from 'next/server';
import { parseNetscapeBookmarks } from '@/lib/parsers/netscape-bookmarks';
import { importBookmarks, validateImportSize } from '@/lib/db/bookmark-import';
import { DuplicateStrategy } from '@/lib/validations/bookmark-import';
import { validateFileSize, validateFileType } from '@/lib/validations/bookmark-import';

/**
 * POST /api/bookmarks/import
 * Import bookmarks from Netscape HTML format
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const strategyParam = formData.get('strategy') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    try {
      validateFileSize(file);
      validateFileType(file);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid file',
        },
        { status: 400 }
      );
    }

    // Parse strategy
    const strategy =
      strategyParam === 'update'
        ? DuplicateStrategy.UPDATE
        : DuplicateStrategy.SKIP;

    // Read file content
    const content = await file.text();

    // Parse HTML
    let bookmarkTree;
    try {
      bookmarkTree = parseNetscapeBookmarks(content);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid bookmark file format',
          details: error instanceof Error ? error.message : 'Unknown parsing error',
        },
        { status: 400 }
      );
    }

    // Validate import size
    try {
      validateImportSize(bookmarkTree);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Import too large',
        },
        { status: 400 }
      );
    }

    // Import bookmarks
    const result = importBookmarks(bookmarkTree, { strategy });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import bookmarks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
