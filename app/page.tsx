"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [accessToken, setAccessToken] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState("");

  // Check for OAuth callback parameters and stored session
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('twitter_connected');
    const token = urlParams.get('access_token');
    const username = urlParams.get('username');
    const name = urlParams.get('name');
    const error = urlParams.get('error');

    console.log('OAuth callback params:', { connected, token: token ? 'present' : 'missing', username, name, error });

    if (connected === 'true' && token) {
      // Store OAuth session
      localStorage.setItem('twitter_access_token', token);
      localStorage.setItem('twitter_username', username || '');
      localStorage.setItem('twitter_name', name || '');
      
      setTwitterConnected(true);
      setAccessToken(token);
      setUserInfo({ username, name });
      
      console.log('Twitter connected successfully:', { username, name });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      console.error('OAuth error:', error);
      alert(`Twitter connection failed: ${error}`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Check for existing session
      const storedToken = localStorage.getItem('twitter_access_token');
      const storedUsername = localStorage.getItem('twitter_username');
      const storedName = localStorage.getItem('twitter_name');
      
      if (storedToken) {
        setTwitterConnected(true);
        setAccessToken(storedToken);
        setUserInfo({ username: storedUsername, name: storedName });
        console.log('Restored Twitter session:', { username: storedUsername, name: storedName });
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!twitterConnected) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query,
          twitterAccessToken: accessToken 
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

  function connectTwitter() {
    window.location.href = '/api/auth?action=login';
  }

  function handleManualTokenSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualToken.trim()) {
      localStorage.setItem('twitter_access_token', manualToken);
      localStorage.setItem('twitter_username', 'Manual Token');
      localStorage.setItem('twitter_name', 'Manual Connection');
      
      setTwitterConnected(true);
      setAccessToken(manualToken);
      setUserInfo({ username: 'Manual Token', name: 'Manual Connection' });
      setShowManualInput(false);
      setManualToken("");
    }
  }

  function disconnectTwitter() {
    localStorage.removeItem('twitter_access_token');
    localStorage.removeItem('twitter_username');
    localStorage.removeItem('twitter_name');
    setTwitterConnected(false);
    setAccessToken("");
    setUserInfo(null);
    setResults(null);
    setShowManualInput(false);
    setManualToken("");
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
              <div>
                <span className="text-sm font-medium">
                  Twitter: {twitterConnected ? 'Connected' : 'Not Connected'}
                </span>
                {twitterConnected && userInfo && (
                  <div className="text-xs text-gray-600">
                    @{userInfo.username} • {userInfo.name}
                  </div>
                )}
              </div>
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
                onClick={connectTwitter}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Connect Twitter
              </button>
            )}
          </div>
        </div>

        {/* Connection Info */}
        {!twitterConnected && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">Connect Your Twitter Account</h3>
            <p className="mb-3 text-sm text-blue-700">
              Connect your Twitter account to analyze trends and get AI-powered insights. 
              We'll only access your public data for analysis.
            </p>
            <div className="flex gap-2">
              <button
                onClick={connectTwitter}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Connect with Twitter
              </button>
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Manual Token
              </button>
            </div>
            
            {showManualInput && (
              <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                <p className="mb-2 text-xs text-gray-600">
                  If OAuth doesn't work, you can manually enter your Twitter Bearer Token
                </p>
                <form onSubmit={handleManualTokenSubmit} className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Your Twitter Bearer Token"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    Connect
                  </button>
                </form>
              </div>
            )}
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
