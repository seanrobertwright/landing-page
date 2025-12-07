import { NextResponse } from 'next/server';
import { buildTree } from '@/lib/db/tree';

export async function GET() {
  try {
    const tree = buildTree();
    return NextResponse.json(tree);
  } catch (error) {
    console.error('Failed to build tree:', error);
    return NextResponse.json({ error: 'Failed to build tree' }, { status: 500 });
  }
}
