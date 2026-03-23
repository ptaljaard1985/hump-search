"use client";

import { useState, useEffect, useCallback } from "react";
import { ContentType } from "@/lib/types";

const CONTENT_TYPES: { value: ContentType; label: string; inputMode: "text" | "file" }[] = [
  { value: "article", label: "Client Article", inputMode: "text" },
  { value: "advisor-doc", label: "Adviser Document", inputMode: "text" },
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
  const [fileMediaType, setFileMediaType] = useState<string>("");
  const [fileName, setFileName] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryGenerated, setSummaryGenerated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<IndexedItem[]>([]);

  const [filterType, setFilterType] = useState<ContentType | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const selectedType = CONTENT_TYPES.find((t) => t.value === contentType)!;

  const filteredItems =
    filterType === "all" ? items : items.filter((item) => item.type === filterType);

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
      // Extract media type and base64 data
      const mediaType = result.split(";")[0].split(":")[1];
      const base64 = result.split(",")[1];
      setFileMediaType(mediaType);
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
        body: JSON.stringify({ password, title, type: contentType, content, mediaType: fileMediaType }),
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
        body: JSON.stringify({ password, title, url, type: contentType, content, summary, mediaType: fileMediaType }),
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">
              Indexed Content ({filteredItems.length}{filterType !== "all" ? ` of ${items.length}` : ""} items)
            </h2>
          </div>

          {/* Type filter tabs */}
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setFilterType("all")}
                className={`text-xs px-3 py-1 rounded-full ${
                  filterType === "all"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({items.length})
              </button>
              {CONTENT_TYPES.map((t) => {
                const count = items.filter((item) => item.type === t.value).length;
                if (count === 0) return null;
                return (
                  <button
                    key={t.value}
                    onClick={() => setFilterType(t.value)}
                    className={`text-xs px-3 py-1 rounded-full ${
                      filterType === t.value
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t.label} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {filteredItems.length === 0 ? (
            <p className="text-sm text-gray-500">No content indexed yet.</p>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div
                    className="p-4 flex justify-between items-start cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
                    }
                  >
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{item.title}</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-gray-400 text-xs mt-1">
                      {expandedId === item.id ? "collapse" : "expand"}
                    </span>
                  </div>

                  {expandedId === item.id && (
                    <div className="px-4 pb-4 border-t bg-gray-50">
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">URL</p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline break-all"
                        >
                          {item.url}
                        </a>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Summary</p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {item.summary}
                        </p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 text-xs hover:text-red-700 border border-red-200 px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
