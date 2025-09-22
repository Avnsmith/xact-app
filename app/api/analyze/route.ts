import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query, twitterBearerToken } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!twitterBearerToken) {
      return NextResponse.json({ error: "Twitter Bearer Token is required" }, { status: 400 });
    }

    // 1. Fetch tweets from Twitter API using user's token
    const twitterRes = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(
        query
      )}&max_results=20&tweet.fields=public_metrics,created_at,author_id&user.fields=username,name&expansions=author_id`,
      {
        headers: { 
          Authorization: `Bearer ${twitterBearerToken}`,
        },
      }
    );

    if (!twitterRes.ok) {
      const errorData = await twitterRes.json();
      console.error("Twitter API error:", errorData);
      
      if (twitterRes.status === 401) {
        return NextResponse.json({ 
          error: "Invalid Twitter API token. Please check your Bearer Token and try again." 
        }, { status: 401 });
      }
      
      throw new Error(`Twitter API error: ${twitterRes.status} - ${errorData.detail || 'Unknown error'}`);
    }

    const tweets = await twitterRes.json();

    // 2. Send to Fireworks AI for analysis
    const fireworksRes = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.FIREWORKS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/kimi-k2-instruct-0905",
        messages: [
          {
            role: "system",
            content: `You are Xact — an assistant that analyzes X/Twitter signals and suggests short actionable keywords and tweet drafts.

Your task is to analyze Twitter data and provide:
1. Top 5 hashtag/keywords to use now (trending and relevant)
2. 3 tweet drafts in a professional, engaging style (under 280 characters each)
3. Short explanation why each keyword is suggested (<20 words each)

Always respond with valid JSON in this exact format:
{
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "tweetDrafts": ["draft1", "draft2", "draft3"],
  "explanations": ["explanation1", "explanation2", "explanation3", "explanation4", "explanation5"]
}

Focus on current trends, engagement potential, and actionable insights.`
          },
          {
            role: "user",
            content: `Analyze Twitter trends for "${query}".

Tweet Data:
- Total tweets found: ${tweets.data?.length || 0}
- Sample tweets: ${JSON.stringify(tweets.data?.slice(0, 10) || [])}
- Meta data: ${JSON.stringify(tweets.meta || {})}

Provide your analysis in the JSON format specified.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!fireworksRes.ok) {
      const errorData = await fireworksRes.json();
      console.error("Fireworks API error:", errorData);
      throw new Error(`Fireworks API error: ${fireworksRes.status}`);
    }

    const fireworksData = await fireworksRes.json();
    const analysisText = fireworksData.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error("No analysis received from Fireworks AI");
    }

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", analysisText);
      // Fallback: try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response from AI");
      }
    }

    return NextResponse.json({ 
      query,
      tweetCount: tweets.data?.length || 0,
      analysis: analysis.response || analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { 
        error: "Failed to analyze trends", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
