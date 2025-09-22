"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-md">
        <h1 className="mb-4 text-2xl font-bold">🚀 Xact – Trend Analyzer</h1>

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
            disabled={loading}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {results && (
          <div className="mt-6 space-y-2">
            <h2 className="text-lg font-semibold">Recommendations:</h2>
            <pre className="rounded-lg bg-gray-100 p-3 text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
