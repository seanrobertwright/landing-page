import { NextRequest, NextResponse } from 'next/server';
import { searchAll } from '@/lib/db/search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Validate query parameter
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    if (query.length > 100) {
      return NextResponse.json(
        { error: 'Query too long (max 100 characters)' },
        { status: 400 }
      );
    }

    // Execute search
    const result = searchAll(query, 50);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search query failed:', error);
    return NextResponse.json({ error: 'Search query failed' }, { status: 500 });
  }
}
