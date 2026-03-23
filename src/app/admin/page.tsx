"use client";

import { useState, useEffect, useCallback } from "react";
import { ContentType } from "@/lib/types";

const CONTENT_TYPES: { value: ContentType; label: string; inputMode: "text" | "file" }[] = [
  { value: "article", label: "Client Article", inputMode: "text" },
  { value: "advisor-doc", label: "Advisor Document", inputMode: "text" },
  { value: "infographic", label: "Infographic", inputMode: "file" },
  { value: "pdf-guide", label: "PDF Guide", inputMode: "file" },
  { value: "video", label: "Video", inputMode: "text" },
  { value: "email-sequence", label: "Email Sequence", inputMode: "text" },
];

interface IndexedItem {
  id: string;
  title: string;
  url: string;
  type: ContentType;
  summary: string;
  created_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [contentType, setContentType] = useState<ContentType>("article");
  const [textContent, setTextContent] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryGenerated, setSummaryGenerated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<IndexedItem[]>([]);

  const selectedType = CONTENT_TYPES.find((t) => t.value === contentType)!;

  const loadItems = useCallback(async () => {
    const res = await fetch("/api/content", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
    }
  }, [password]);

  useEffect(() => {
    if (authenticated) loadItems();
  }, [authenticated, loadItems]);

  const handleLogin = async () => {
    const res = await fetch("/api/content", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setAuthenticated(true);
    } else {
      setStatus("Invalid password");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 data after the prefix
      const base64 = result.split(",")[1];
      setFileContent(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSummary = async () => {
    setLoading(true);
    setStatus("Generating summary...");

    const content = selectedType.inputMode === "file" ? fileContent : textContent;

    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, title, type: contentType, content }),
      });

      if (!res.ok) throw new Error("Failed to generate summary");

      const data = await res.json();
      setSummary(data.summary);
      setSummaryGenerated(true);
      setStatus("Summary generated — review and edit if needed, then save.");
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndIndex = async () => {
    setLoading(true);
    setStatus("Saving and indexing...");

    const content = selectedType.inputMode === "file" ? fileContent : textContent;

    try {
      const res = await fetch("/api/index-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, title, url, type: contentType, content, summary }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to index content");
      }

      setStatus("Content indexed successfully!");
      setTitle("");
      setUrl("");
      setTextContent("");
      setFileContent(null);
      setFileName("");
      setSummary("");
      setSummaryGenerated(false);
      await loadItems();
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const res = await fetch("/api/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id }),
    });

    if (res.ok) {
      await loadItems();
      setStatus("Item deleted.");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h1 className="text-xl font-semibold mb-4">HUM Content Admin</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full p-2 border rounded mb-3 text-sm"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-black text-white py-2 rounded text-sm hover:bg-gray-800"
          >
            Login
          </button>
          {status && <p className="mt-3 text-red-600 text-sm">{status}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">HUM Content Admin</h1>

        {/* Index New Content */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-medium mb-4">Index New Content</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                placeholder="e.g. The Elephant and the Rider"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                placeholder="https://humunder.../content-page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => {
                  setContentType(e.target.value as ContentType);
                  setSummary("");
                  setSummaryGenerated(false);
                }}
                className="w-full p-2 border rounded text-sm"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedType.inputMode === "text" ? (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Paste Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full p-2 border rounded text-sm h-48"
                  placeholder="Paste the full content here..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Upload {contentType === "infographic" ? "Image" : "PDF"}
                </label>
                <input
                  type="file"
                  accept={contentType === "infographic" ? "image/*" : ".pdf"}
                  onChange={handleFileUpload}
                  className="w-full p-2 border rounded text-sm"
                />
                {fileName && (
                  <p className="text-xs text-gray-500 mt-1">Selected: {fileName}</p>
                )}
              </div>
            )}

            <button
              onClick={handleGenerateSummary}
              disabled={loading || !title || (!textContent && !fileContent)}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Summary"}
            </button>

            {summaryGenerated && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Generated Summary{" "}
                    <span className="text-gray-400 font-normal">
                      (edit if needed)
                    </span>
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full p-2 border rounded text-sm h-36"
                  />
                </div>

                <button
                  onClick={handleSaveAndIndex}
                  disabled={loading || !summary}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save & Index"}
                </button>
              </>
            )}

            {status && (
              <p className="text-sm text-gray-600">{status}</p>
            )}
          </div>
        </div>

        {/* Indexed Content List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium mb-4">
            Indexed Content ({items.length} items)
          </h2>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500">No content indexed yet.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded p-3 flex justify-between items-start"
                >
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.title}</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {item.summary}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 text-xs hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
