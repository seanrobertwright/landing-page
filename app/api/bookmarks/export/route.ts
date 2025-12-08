import { NextResponse } from 'next/server';
import { exportBookmarksToJson, generateExportFilename } from '@/lib/exporters/json-bookmarks';

/**
 * GET /api/bookmarks/export
 * Export all bookmarks to JSON format
 */
export async function GET() {
  try {
    const exportData = exportBookmarksToJson();
    const filename = generateExportFilename();

    // Return JSON with appropriate headers for download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
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
