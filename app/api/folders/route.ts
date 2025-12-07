import { NextRequest, NextResponse } from 'next/server';
import { getAllFolders, createFolder } from '@/lib/db/folders';
import { createFolderSchema } from '@/lib/validations/folder';

export async function GET() {
  try {
    const folders = getAllFolders();
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Failed to fetch folders:', error);
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createFolderSchema.parse(body);
    const folder = createFolder(validatedData);
    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error('Failed to create folder:', error);
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
