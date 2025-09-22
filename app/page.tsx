"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // Check if user has Twitter API key stored
  useEffect(() => {
    const storedKey = localStorage.getItem('twitter_bearer_token');
    if (storedKey) {
      setTwitterConnected(true);
      setApiKey(storedKey);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!twitterConnected) {
      setShowApiKeyForm(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query,
          twitterBearerToken: apiKey 
        }),
      });

      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Error analyzing:", error);
      setResults({ error: "Failed to analyze trends" });
    } finally {
      setLoading(false);
    }
  }

  function handleApiKeySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('twitter_bearer_token', apiKey);
      setTwitterConnected(true);
      setShowApiKeyForm(false);
    }
  }

  function disconnectTwitter() {
    localStorage.removeItem('twitter_bearer_token');
    setTwitterConnected(false);
    setApiKey("");
    setResults(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-md">
        <h1 className="mb-4 text-2xl font-bold">🚀 Xact – Trend Analyzer</h1>
        
        {/* Twitter Connection Status */}
        <div className="mb-4 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${twitterConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm font-medium">
                Twitter API: {twitterConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            {twitterConnected ? (
              <button
                onClick={disconnectTwitter}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => setShowApiKeyForm(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* API Key Form */}
        {showApiKeyForm && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">Connect Your Twitter API</h3>
            <p className="mb-3 text-sm text-blue-700">
              Enter your Twitter Bearer Token to analyze trends. Get one from{' '}
              <a 
                href="https://developer.twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                Twitter Developer Portal
              </a>
            </p>
            <form onSubmit={handleApiKeySubmit} className="flex gap-2">
              <input
                type="password"
                placeholder="Your Twitter Bearer Token"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 rounded-lg border border-blue-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Connect
              </button>
              <button
                type="button"
                onClick={() => setShowApiKeyForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Main Analysis Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter keyword (e.g. crypto, web3)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {!twitterConnected && (
          <p className="mt-2 text-sm text-gray-600">
            Connect your Twitter API to start analyzing trends
          </p>
        )}

        {results && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Analysis Results:</h2>
            
            {results.error ? (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-red-800">{results.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.analysis && (
                  <>
                    {results.analysis.keywords && (
                      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                        <h3 className="font-semibold text-green-900 mb-2">🔥 Top Keywords to Use Now:</h3>
                        <div className="flex flex-wrap gap-2">
                          {results.analysis.keywords.map((keyword: string, index: number) => (
                            <span key={index} className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                              #{keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {results.analysis.tweetDrafts && (
                      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">📝 Tweet Drafts:</h3>
                        <div className="space-y-2">
                          {results.analysis.tweetDrafts.map((draft: string, index: number) => (
                            <div key={index} className="rounded bg-white p-3 text-sm">
                              {draft}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {results.analysis.explanations && (
                      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2">💡 Why These Keywords:</h3>
                        <ul className="space-y-1 text-sm text-yellow-800">
                          {results.analysis.explanations.map((explanation: string, index: number) => (
                            <li key={index}>• {explanation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
                
                <details className="rounded-lg bg-gray-50 p-4">
                  <summary className="cursor-pointer font-medium">Raw Data</summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
