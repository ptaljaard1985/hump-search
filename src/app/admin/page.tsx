"use client";

import { useState, useEffect, useCallback } from "react";
import { ContentType } from "@/lib/types";

const CONTENT_TYPES: { value: ContentType; label: string; inputMode: "text" | "file" }[] = [
  { value: "article", label: "Client Article", inputMode: "text" },
  { value: "advisor-doc", label: "Adviser Document", inputMode: "text" },
  { value: "infographic", label: "Infographic", inputMode: "text" },
  { value: "pdf-guide", label: "PDF Guide", inputMode: "text" },
  { value: "video", label: "Video", inputMode: "text" },
  { value: "email-sequence", label: "Email Sequence", inputMode: "text" },
];

const TYPE_COLORS: Record<ContentType, { bg: string; text: string; activeBg: string }> = {
  "article": { bg: "bg-blue-50", text: "text-blue-700", activeBg: "bg-blue-600" },
  "advisor-doc": { bg: "bg-amber-50", text: "text-amber-700", activeBg: "bg-amber-600" },
  "infographic": { bg: "bg-purple-50", text: "text-purple-700", activeBg: "bg-purple-600" },
  "pdf-guide": { bg: "bg-emerald-50", text: "text-emerald-700", activeBg: "bg-emerald-600" },
  "video": { bg: "bg-rose-50", text: "text-rose-700", activeBg: "bg-rose-600" },
  "email-sequence": { bg: "bg-cyan-50", text: "text-cyan-700", activeBg: "bg-cyan-600" },
};

interface IndexedItem {
  id: string;
  title: string;
  url: string;
  type: ContentType;
  summary: string;
  created_at: string;
}

export default function AdminPage() {
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

  const [duplicateModal, setDuplicateModal] = useState<{
    message: string;
    existingItem: { id: string; title: string; url: string; type: string };
  } | null>(null);

  const [filterType, setFilterType] = useState<ContentType | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [searchLogs, setSearchLogs] = useState<{ id: string; query: string; result_count: number; created_at: string }[]>([]);
  const [logsVisible, setLogsVisible] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  const selectedType = CONTENT_TYPES.find((t) => t.value === contentType)!;

  const filteredItems =
    filterType === "all" ? items : items.filter((item) => item.type === filterType);

  const loadItems = useCallback(async () => {
    const res = await fetch("/api/content");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

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
        body: JSON.stringify({ title, type: contentType, content, mediaType: fileMediaType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate summary");
      setSummary(data.summary);
      setSummaryGenerated(true);
      setStatus("Summary generated — review and edit if needed, then save.");
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const saveAndIndex = async (replaceId?: string) => {
    setLoading(true);
    setStatus(replaceId ? "Replacing and indexing..." : "Saving and indexing...");

    const content = selectedType.inputMode === "file" ? fileContent : textContent;

    try {
      const res = await fetch("/api/index-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, type: contentType, content, summary, mediaType: fileMediaType, replaceId }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setDuplicateModal({ message: data.message, existingItem: data.existingItem });
        setLoading(false);
        setStatus("");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to index content");
      }

      const data = await res.json();
      if (replaceId) {
        // Remove old item and add new one in local state
        setItems((prev) => [...prev.filter((i) => i.id !== replaceId), data.item]);
      } else if (data.item) {
        setItems((prev) => [...prev, data.item]);
      }
      setStatus(replaceId ? "Content replaced successfully!" : "Content indexed successfully!");
      setTitle("");
      setUrl("");
      setTextContent("");
      setFileContent(null);
      setFileName("");
      setSummary("");
      setSummaryGenerated(false);
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndIndex = () => saveAndIndex();

  const handleReplaceDuplicate = () => {
    if (!duplicateModal) return;
    const replaceId = duplicateModal.existingItem.id;
    setDuplicateModal(null);
    saveAndIndex(replaceId);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const res = await fetch("/api/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      await loadItems();
      setStatus("Item deleted.");
    }
  };

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
                  {contentType === "pdf-guide" ? "PDF URL" : contentType === "infographic" ? "Image URL" : "Paste Content"}
                </label>
                {contentType === "pdf-guide" || contentType === "infographic" ? (
                  <input
                    type="url"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    placeholder={contentType === "pdf-guide" ? "https://example.com/guide.pdf" : "https://example.com/infographic.png"}
                  />
                ) : (
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full p-2 border rounded text-sm h-48"
                    placeholder="Paste the full content here..."
                  />
                )}
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

        {/* Search Logs */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Search Logs</h2>
            <div className="flex gap-2">
              {logsVisible && (
                <button
                  onClick={async () => {
                    setLogsLoading(true);
                    try {
                      const res = await fetch("/api/search-logs");
                      const data = await res.json();
                      if (res.ok) setSearchLogs(data.logs);
                    } catch (err) {
                      console.error("Failed to fetch search logs:", err);
                    } finally {
                      setLogsLoading(false);
                    }
                  }}
                  disabled={logsLoading}
                  className="text-xs border px-3 py-1 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  {logsLoading ? "Loading..." : "Refresh"}
                </button>
              )}
              <button
                onClick={async () => {
                  if (logsVisible) {
                    setLogsVisible(false);
                    return;
                  }
                  setLogsLoading(true);
                  try {
                    const res = await fetch("/api/search-logs");
                    const data = await res.json();
                    if (res.ok) setSearchLogs(data.logs);
                  } catch (err) {
                    console.error("Failed to fetch search logs:", err);
                  } finally {
                    setLogsLoading(false);
                    setLogsVisible(true);
                  }
                }}
                className="text-xs border px-3 py-1 rounded hover:bg-gray-50"
              >
                {logsVisible ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {logsVisible && (
            searchLogs.length === 0 ? (
              <p className="text-sm text-gray-500">No searches logged yet.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-gray-800">{log.query}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Indexed Content List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">
              Indexed Content ({filteredItems.length}{filterType !== "all" ? ` of ${items.length}` : ""} items)
            </h2>
            {items.length > 0 && (
              <a
                href="/api/backup"
                download
                className="text-xs border px-3 py-1 rounded hover:bg-gray-50"
              >
                Download Backup
              </a>
            )}
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
                        ? `${TYPE_COLORS[t.value].activeBg} text-white`
                        : `${TYPE_COLORS[t.value].bg} ${TYPE_COLORS[t.value].text} hover:opacity-80`
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
                        <span className={`text-xs px-2 py-0.5 rounded ${TYPE_COLORS[item.type].bg} ${TYPE_COLORS[item.type].text}`}>
                          {CONTENT_TYPES.find((t) => t.value === item.type)?.label || item.type}
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

        {/* Duplicate Detection Modal */}
        {duplicateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-red-600 mb-3">Duplicate Found</h3>
              <p className="text-sm text-gray-700 mb-4">{duplicateModal.message}</p>
              <div className="bg-gray-50 rounded p-3 mb-4 text-sm">
                <p className="font-medium">{duplicateModal.existingItem.title}</p>
                <p className="text-xs text-gray-500 mt-1">{duplicateModal.existingItem.url}</p>
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded mt-1 inline-block">
                  {duplicateModal.existingItem.type}
                </span>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setDuplicateModal(null);
                    setStatus("Indexing cancelled.");
                  }}
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplaceDuplicate}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Replace Existing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
