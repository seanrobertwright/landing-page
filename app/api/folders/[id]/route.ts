import { NextRequest, NextResponse } from 'next/server';
import { getFolderById, updateFolder, deleteFolder } from '@/lib/db/folders';
import { updateFolderSchema } from '@/lib/validations/folder';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const folder = getFolderById(id);
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }
    return NextResponse.json(folder);
  } catch (error) {
    console.error('Failed to fetch folder:', error);
    return NextResponse.json({ error: 'Failed to fetch folder' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateFolderSchema.parse(body);
    const folder = updateFolder(id, validatedData);
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }
    return NextResponse.json(folder);
  } catch (error) {
    console.error('Failed to update folder:', error);
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteFolder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete folder:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
