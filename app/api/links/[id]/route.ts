import { NextRequest, NextResponse } from 'next/server';
import { getLinkById, updateLink, deleteLink } from '@/lib/db/links';
import { updateLinkSchema } from '@/lib/validations/link';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const link = getLinkById(id);
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    return NextResponse.json(link);
  } catch (error) {
    console.error('Failed to fetch link:', error);
    return NextResponse.json({ error: 'Failed to fetch link' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateLinkSchema.parse(body);
    const link = updateLink(id, validatedData);
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    return NextResponse.json(link);
  } catch (error) {
    console.error('Failed to update link:', error);
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteLink(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete link:', error);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
