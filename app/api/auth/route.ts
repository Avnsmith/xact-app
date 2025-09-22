import { NextResponse } from "next/server";

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

    const twitterAuthUrl = new URL('https://twitter.com/i/oauth2/authorize');
    twitterAuthUrl.searchParams.set('response_type', 'code');
    twitterAuthUrl.searchParams.set('client_id', clientId);
    twitterAuthUrl.searchParams.set('redirect_uri', redirectUri);
    twitterAuthUrl.searchParams.set('scope', 'tweet.read users.read');
    twitterAuthUrl.searchParams.set('state', 'xact-twitter-auth');
    twitterAuthUrl.searchParams.set('code_challenge', 'challenge');
    twitterAuthUrl.searchParams.set('code_challenge_method', 'plain');

    return NextResponse.redirect(twitterAuthUrl.toString());
  }

  return NextResponse.json({ 
    error: "Invalid action. Use ?action=login" 
  }, { status: 400 });
}
