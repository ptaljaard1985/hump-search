import OpenAI from "openai";
import { ContentItem, ContentType, SearchResult } from "./types";

let _openai: OpenAI | null = null;

function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export function buildEmbeddingText(title: string, type: ContentType, summary: string): string {
  const typeLabel = type.replace("-", " ");
  return `${title}\n${typeLabel}\n\n${summary}`;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dotProduct / denom;
}

export function findSimilarContent(
  queryEmbedding: number[],
  items: ContentItem[],
  topK: number = 6,
  minSimilarity: number = 0.25
): SearchResult[] {
  const results: SearchResult[] = items.map((item) => ({
    item,
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  results.sort((a, b) => b.similarity - a.similarity);
  return results.filter((r) => r.similarity >= minSimilarity).slice(0, topK);
}
