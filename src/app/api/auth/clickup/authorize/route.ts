import { NextResponse } from 'next/server';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce';
import { cookies } from 'next/headers';

// Configurando para usar runtime de Node.js ya que crypto se usa masivamente
export const runtime = 'nodejs';

export async function GET() {
  try {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = Math.random().toString(36).substring(7);

    const cookieStore = cookies();
    cookieStore.set('clickup_code_verifier', codeVerifier, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300 
    });
    cookieStore.set('clickup_state', state, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300 
    });

    const clientId = process.env.CLICKUP_CLIENT_ID;
    const redirectUri = process.env.CLICKUP_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json({ error: 'CLICKUP_CLIENT_ID or CLICKUP_REDIRECT_URI not configured' }, { status: 500 });
    }

    const url = new URL('https://app.clickup.com/api');
    // Nota: ClickUp usa un flujo ligeramente distinto a veces, pero para OAuth2.1/PKCE:
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('code_challenge', codeChallenge);
    url.searchParams.append('code_challenge_method', 'S256');
    url.searchParams.append('state', state);

    return NextResponse.redirect(url.toString());
  } catch (error) {
    return NextResponse.json({ error: 'Auth failed to start', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}
