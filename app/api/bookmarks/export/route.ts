import { NextResponse } from 'next/server';
import {
  exportBookmarksToJson,
  generateExportFilename,
  streamBookmarkExport,
} from '@/lib/exporters/json-bookmarks';
import { getAllLinks } from '@/lib/db/links';

/**
 * GET /api/bookmarks/export
 * Export all bookmarks to JSON format
 * Uses streaming for large exports (>5000 bookmarks)
 */
export async function GET() {
  try {
    const filename = generateExportFilename();

    // Check link count to decide streaming vs regular export
    const links = getAllLinks();
    const shouldStream = links.length > 5000;

    if (shouldStream) {
      // Use streaming for large exports
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamBookmarkExport()) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new NextResponse(stream, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Transfer-Encoding': 'chunked',
        },
      });
    } else {
      // Use regular export for smaller datasets
      const exportData = exportBookmarksToJson();

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export bookmarks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
