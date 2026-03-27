"use client";

import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";

const SUGGESTED_PROMPTS = [
  "My client is panicking about a market drop",
  "Something to send in a newsletter about staying invested",
  "Content for onboarding a new client",
  "How to explain fees and the value of advice",
  "Visuals that explain risk to clients",
  "Help with a client who wants to move everything to cash",
  "Content about compounding and long-term growth",
  "How to handle clients asking about market predictions",
  "Resources for a discovery meeting with a new prospect",
  "Client couple disagreeing about financial priorities",
  "How to explain why we don't time the market",
  "Content about simplifying finances and getting organised",
  "Helping a client understand diversification",
  "Documents for managing a client's transition to our firm",
  "Visuals showing why equities outperform over time",
  "Content for business owners planning for independence",
  "How to reassure a client who keeps checking their portfolio",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const GROUP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Client Articles": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Adviser Documents": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "Infographics": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "PDF Guides": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Videos": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  "Email Sequences": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
};

function getGroupColor(text: string) {
  return GROUP_COLORS[text] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const suggestions = useMemo(() => pickRandom(SUGGESTED_PROMPTS, 5), []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setRecommendation("");
    setSearched(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setRecommendation(data.recommendation);
    } catch {
      setRecommendation(
        "Sorry, something went wrong. Please try again or browse the content library directly."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-xl font-semibold mb-1">HUM Content Search</h1>
        <p className="text-sm text-gray-500 mb-6">
          Describe your situation or what you need, and we&apos;ll find the right
          content for you.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. My client is worried about retiring in 5 years..."
            className="flex-1 p-3 border rounded-lg text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="bg-black text-white px-6 py-3 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {!searched && !loading && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-2">Try something like:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    setTimeout(() => {
                      setLoading(true);
                      setRecommendation("");
                      setSearched(true);
                      fetch("/api/search", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ query: s }),
                      })
                        .then((res) => res.json())
                        .then((data) => setRecommendation(data.recommendation))
                        .catch(() =>
                          setRecommendation("Sorry, something went wrong. Please try again.")
                        )
                        .finally(() => setLoading(false));
                    }, 0);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-sm text-gray-500 animate-pulse">
            Finding the best content for your situation...
          </div>
        )}

        {!loading && searched && recommendation && (
          <div className="space-y-4">
            <ReactMarkdown
              components={{
                h2: ({ children }) => {
                  const text = String(children);
                  const color = getGroupColor(text);
                  return (
                    <div className={`mt-6 mb-3 px-4 py-2.5 rounded-lg border ${color.bg} ${color.border}`}>
                      <h2 className={`text-base font-semibold ${color.text}`}>{children}</h2>
                    </div>
                  );
                },
                h3: ({ children }) => (
                  <div className="pt-2">
                    <h3 className="text-base font-semibold">{children}</h3>
                  </div>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {children}
                  </a>
                ),
                p: ({ children }) => (
                  <p className="text-sm text-gray-700 leading-relaxed mt-1 mb-0">
                    {children}
                  </p>
                ),
                hr: () => <hr className="border-gray-100 my-4" />,
              }}
            >
              {recommendation}
            </ReactMarkdown>
          </div>
        )}

        {!loading && searched && !recommendation && (
          <p className="text-sm text-gray-500">
            No results found. Try describing your situation differently.
          </p>
        )}
      </div>
    </div>
  );
}
