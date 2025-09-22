import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Fetch tweets from Twitter API
    const twitterRes = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(
        query
      )}&max_results=20&tweet.fields=public_metrics`,
      {
        headers: { 
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    if (!twitterRes.ok) {
      throw new Error(`Twitter API error: ${twitterRes.status}`);
    }

    const tweets = await twitterRes.json();

    // 2. Send to Sentient LLM for analysis
    const sentientRes = await fetch("https://api.sentient.xyz/agent", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SENTIENT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `Analyze Twitter trends for "${query}" and suggest:
        1. Top 5 hashtag/keywords to use now
        2. 3 tweet drafts in a professional style
        3. Short explanation why each keyword is suggested (<20 words each)
        
        Format the response as JSON with keys: keywords, tweetDrafts, explanations`,
        context: tweets,
      }),
    });

    if (!sentientRes.ok) {
      throw new Error(`Sentient API error: ${sentientRes.status}`);
    }

    const analysis = await sentientRes.json();

    return NextResponse.json({ 
      query,
      tweets: tweets.data || [],
      analysis 
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze trends", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
