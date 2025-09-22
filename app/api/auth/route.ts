import { NextResponse } from "next/server";
import crypto from "crypto";

// Twitter OAuth2 authentication route
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'login') {
    // Step 1: Redirect to Twitter OAuth
    const clientId = process.env.TWITTER_CLIENT_ID;
    const redirectUri = process.env.TWITTER_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      return NextResponse.json({ 
        error: "Twitter OAuth not configured. Missing CLIENT_ID or REDIRECT_URI" 
      }, { status: 500 });
    }

    // Generate PKCE parameters
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    const state = crypto.randomBytes(16).toString('hex');

    const twitterAuthUrl = new URL('https://twitter.com/i/oauth2/authorize');
    twitterAuthUrl.searchParams.set('response_type', 'code');
    twitterAuthUrl.searchParams.set('client_id', clientId);
    twitterAuthUrl.searchParams.set('redirect_uri', redirectUri);
    twitterAuthUrl.searchParams.set('scope', 'tweet.read users.read');
    twitterAuthUrl.searchParams.set('state', state);
    twitterAuthUrl.searchParams.set('code_challenge', codeChallenge);
    twitterAuthUrl.searchParams.set('code_challenge_method', 'S256');

    // Store PKCE parameters in a cookie for the callback
    const response = NextResponse.redirect(twitterAuthUrl.toString());
    response.cookies.set('oauth_code_verifier', codeVerifier, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600 // 10 minutes
    });
    response.cookies.set('oauth_state', state, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600 // 10 minutes
    });

    return response;
  }

  return NextResponse.json({ 
    error: "Invalid action. Use ?action=login" 
  }, { status: 400 });
}
