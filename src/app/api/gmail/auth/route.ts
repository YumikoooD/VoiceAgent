import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
  : 'http://localhost:3000/api/gmail/callback';

// GET: Generate OAuth URL for authorization
export async function GET() {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID in .env' },
      { status: 500 }
    );
  }

  const scopes = [
    // Gmail scopes
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    // Calendar scopes
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  return NextResponse.json({ authUrl: authUrl.toString() });
}

// POST: Exchange authorization code for tokens
export async function POST(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Google OAuth not configured' },
      { status: 500 }
    );
  }

  try {
    const { code } = await request.json();

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      return NextResponse.json(
        { error: tokens.error_description || tokens.error },
        { status: 400 }
      );
    }

    // Get user email for display
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const userInfo = await userInfoResponse.json();

    return NextResponse.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      email: userInfo.email,
    });
  } catch (error) {
    console.error('OAuth token exchange error:', error);
    return NextResponse.json(
      { error: 'Failed to exchange authorization code' },
      { status: 500 }
    );
  }
}

