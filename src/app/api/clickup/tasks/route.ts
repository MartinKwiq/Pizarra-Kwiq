import { NextRequest, NextResponse } from 'next/server';
import { getTeamTasks } from '@/lib/clickup';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('team_id');

  if (!teamId) {
    return NextResponse.json({ error: 'Missing team_id parameter' }, { status: 400 });
  }

  try {
    // En producción, extraeríamos el userId de la sesión (ej. NextAuth o Kinde)
    const tasks = await getTeamTasks(teamId, 'default_user');
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[Tasks API Error]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message.includes('not authenticated')) {
      return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch tasks', details: message }, { status: 500 });
  }
}
