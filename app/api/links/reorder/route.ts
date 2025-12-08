import { NextRequest, NextResponse } from 'next/server';
import { reorderLinks } from '@/lib/db/links';
import { reorderLinksSchema } from '@/lib/validations/link';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = reorderLinksSchema.parse(body);
    reorderLinks(validatedData.items);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to reorder links:', error);
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to reorder links' }, { status: 500 });
  }
}
