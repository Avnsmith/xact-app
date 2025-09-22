import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const cookieStore = cookies();
  const storedState = cookieStore.get('oauth_state')?.value;
  const codeVerifier = cookieStore.get('oauth_code_verifier')?.value;

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?error=${encodeURIComponent(error)}`
    );
  }

  // Verify state parameter
  if (!state || !storedState || state !== storedState) {
    console.error('State mismatch:', { state, storedState });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?error=invalid_state`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?error=no_code`
    );
  }

  if (!codeVerifier) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?error=no_code_verifier`
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.TWITTER_CLIENT_ID!,
        redirect_uri: process.env.TWITTER_REDIRECT_URI!,
        code_verifier: codeVerifier
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange error:', errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=username,name,profile_image_url', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('User info error:', errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?error=user_info_failed`
      );
    }

    const userData = await userResponse.json();

    // Redirect back to app with success and token
    const redirectUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    redirectUrl.searchParams.set('twitter_connected', 'true');
    redirectUrl.searchParams.set('access_token', accessToken);
    redirectUrl.searchParams.set('username', userData.data.username);
    redirectUrl.searchParams.set('name', userData.data.name);

    const response = NextResponse.redirect(redirectUrl.toString());
    
    // Clear OAuth cookies
    response.cookies.delete('oauth_code_verifier');
    response.cookies.delete('oauth_state');

    return response;

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?error=oauth_failed`
    );
  }
}
