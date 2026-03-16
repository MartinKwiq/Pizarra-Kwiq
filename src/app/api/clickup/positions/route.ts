import { NextRequest, NextResponse } from 'next/server';
import { saveTaskPosition, getAllTaskPositions } from '@/lib/db';

export async function GET() {
  try {
    const positions = await getAllTaskPositions();
    return NextResponse.json(positions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { taskId, x, y } = await req.json();
    if (!taskId || x === undefined || y === undefined) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    await saveTaskPosition(taskId, x, y);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save position' }, { status: 500 });
  }
}
