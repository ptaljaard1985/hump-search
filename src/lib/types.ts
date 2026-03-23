export type ContentType =
  | "article"
  | "advisor-doc"
  | "infographic"
  | "pdf-guide"
  | "video"
  | "email-sequence";

export interface ContentItem {
  id: string;
  title: string;
  url: string;
  type: ContentType;
  summary: string;
  embedding: number[];
  created_at: string;
  updated_at: string;
}

export interface ContentIndex {
  items: ContentItem[];
}

export interface SearchResult {
  item: ContentItem;
  similarity: number;
}
