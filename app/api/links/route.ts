import { NextRequest, NextResponse } from 'next/server';
import { getAllLinks, createLink } from '@/lib/db/links';
import { createLinkSchema } from '@/lib/validations/link';

export async function GET() {
  try {
    const links = getAllLinks();
    return NextResponse.json(links);
  } catch (error) {
    console.error('Failed to fetch links:', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLinkSchema.parse(body);
    const link = createLink(validatedData);
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Failed to create link:', error);
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}
