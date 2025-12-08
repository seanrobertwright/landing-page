import { NextRequest, NextResponse } from 'next/server';
import { reorderFolders } from '@/lib/db/folders';
import { reorderFoldersSchema } from '@/lib/validations/folder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = reorderFoldersSchema.parse(body);
    reorderFolders(validatedData.items);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to reorder folders:', error);
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to reorder folders' }, { status: 500 });
  }
}
