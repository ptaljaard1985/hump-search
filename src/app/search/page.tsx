"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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

        <div className="flex gap-2 mb-6">
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

        {loading && (
          <div className="text-sm text-gray-500 animate-pulse">
            Finding the best content for your situation...
          </div>
        )}

        {!loading && searched && recommendation && (
          <div className="space-y-4">
            <ReactMarkdown
              components={{
                h3: ({ children }) => {
                  // h3 contains the linked title
                  return (
                    <div className="pt-2">
                      <h3 className="text-base font-semibold">{children}</h3>
                    </div>
                  );
                },
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
                em: ({ children }) => {
                  const text = String(children);
                  // Type labels come through as italic
                  const typeLabels: Record<string, string> = {
                    "article": "Article",
                    "advisor-doc": "Advisor Document",
                    "infographic": "Infographic",
                    "pdf-guide": "PDF Guide",
                    "video": "Video",
                    "email-sequence": "Email Sequence",
                  };
                  const label = typeLabels[text] || typeLabels[text.toLowerCase()];
                  if (label || text.includes("Article") || text.includes("Document") || text.includes("Infographic") || text.includes("Guide") || text.includes("Video") || text.includes("Sequence")) {
                    return (
                      <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mb-2">
                        {label || text}
                      </span>
                    );
                  }
                  return <em>{children}</em>;
                },
                p: ({ children }) => (
                  <p className="text-sm text-gray-700 leading-relaxed mt-1 mb-0">
                    {children}
                  </p>
                ),
                hr: () => <hr className="border-gray-200 my-4" />,
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
