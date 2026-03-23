# HUM Content Search — Product Specification

## Overview

A self-built AI-powered search tool that allows HUM Premium members to find the right content from a 6-year archive of evergreen behavioural finance resources. Members describe their situation in natural language and receive targeted content recommendations with direct links.

The tool also includes an admin interface for indexing content, with AI-powered summary generation.

---

## Architecture

### Approach: Two-Stage Semantic Search

1. **Stage 1 — Vector search (cheap, fast):** Member query is converted to an embedding and matched against pre-computed content embeddings using cosine similarity. Returns top 8–10 candidates.
2. **Stage 2 — Claude recommendation (intelligent):** The 8–10 candidate summaries are passed to Claude Sonnet with the member's query. Claude selects the best 3–5 matches and explains why each is relevant.

### Anti-Hallucination Design

- Claude never searches or recalls content from training data
- Claude only sees content retrieved from the verified index
- System prompt constrains Claude to recommend only from provided items
- Frontend can verify all URLs in responses exist in the index before displaying

### Temperature

All Claude API calls use `temperature: 0` — both summary generation and member search. This ensures consistent, grounded, deterministic responses. No part of this tool benefits from randomness.

---

## Tech Stack

| Component | Tool | Purpose |
|---|---|---|
| Framework | Next.js | Admin UI, search UI, API routes — single project |
| Hosting | Vercel | Free tier sufficient |
| Storage | Vercel Blob | Stores content index JSON |
| Embeddings | OpenAI `text-embedding-3-small` | Converts summaries to vectors |
| Summary generation | Claude Sonnet (articles, docs, PDFs, videos, sequences) / Claude Opus (infographics) | AI-powered content summarisation during indexing |
| Member search responses | Claude Sonnet | Generates natural language recommendations |

### API Keys Required

- OpenAI (embeddings only)
- Anthropic (summary generation + member search)

---

## Content Inventory

| Content Type | Count | Input Method | Model for Summary | Indexed As |
|---|---|---|---|---|
| Client articles | 120 | Paste text | Sonnet | Individual |
| Advisor documents | 40 | Paste text | Sonnet | Individual |
| Infographics | ~40 | Upload image | Opus | Individual |
| PDF guides | 6 | Upload PDF | Sonnet | Individual |
| Videos | 5 | Paste description | Sonnet | Individual |
| Email sequences | 3 | Paste all emails as one | Sonnet | Per sequence |
| **Total** | **~214** | | | |

### Notes on Content

- All content lives on the Squarespace member portal
- Each article has an accompanying sketch — these are not indexed separately but can be referenced alongside their parent article
- Email sequences are indexed as one item per sequence (not per individual email)
- Video descriptions are written manually (5 items, not worth automating transcription from Vimeo)

---

## Admin Tool

**URL:** `/admin` (password-protected)

**Users:** Pierre and assistant

### Indexing Flow

1. Select content type from dropdown
2. Enter title and Squarespace URL
3. Input content:
   - **Articles, advisor docs, email sequences:** Paste text
   - **Infographics:** Upload image
   - **PDF guides:** Upload PDF
   - **Videos:** Paste written description
4. Click "Generate Summary"
5. AI generates a ~150-word use-case-oriented summary
6. Review and edit summary if needed
7. Click "Save & Index" — generates embedding and saves to content index

### Summary Generation System Prompt

The summary generation prompt is pre-loaded with context about:
- HUM Premium as a behavioural finance content platform
- The types of financial advisers who use it
- Common client scenarios (market volatility, retirement anxiety, first meetings, etc.)
- Instruction to describe content as a tool an adviser would use, not an academic description

### Model Routing

- Content type = Infographic → Claude Opus (image interpretation requires stronger reasoning)
- All other types → Claude Sonnet

### Admin Features

- View all indexed content
- Edit existing summaries (regenerates embedding on save)
- Delete content from index

---

## Member Search

**URL:** `/search` (embeddable in Squarespace via iframe or JS snippet)

### Search Flow

1. Member types a natural language query describing their situation or need
2. Query is converted to an embedding via OpenAI
3. Cosine similarity finds the top 8–10 matching content items from the index
4. Those items (title, URL, summary, type) are sent to Claude Sonnet with the query
5. Claude returns a recommendation of 3–5 items with:
   - Content title
   - Content type label
   - Why it's relevant to their situation
   - Direct link to the content on Squarespace

### Edge Cases

- **No good matches:** Claude responds with a helpful message suggesting they browse by category or rephrase their query
- **URL verification:** Frontend checks all returned URLs exist in the content index before displaying

---

## Data Model

Each content item in the index:

```json
{
  "id": "uuid",
  "title": "The Elephant and the Rider",
  "url": "https://humunder.../elephant-rider",
  "type": "article",
  "summary": "Use when a client is making emotional decisions during market volatility...",
  "embedding": [0.0123, -0.0456, ...],
  "created_at": "2026-03-23T00:00:00Z",
  "updated_at": "2026-03-23T00:00:00Z"
}
```

---

## Estimated Costs

### One-Time (Indexing)

| Item | Cost |
|---|---|
| Summary generation (Sonnet) — ~174 items | ~$1 |
| Summary generation (Opus) — ~40 infographics | ~$3–5 |
| Embedding generation — 214 items | ~$0.01 |
| **Total** | **~$5** |

### Ongoing (Monthly)

| Item | Cost |
|---|---|
| Vercel hosting | Free tier |
| Vercel Blob storage | Free tier |
| Claude search queries (500 queries/mo) | ~$10 |
| Claude search queries (1,750 queries/mo) | ~$35 |
| New content indexing | Negligible |

---

## Project Structure

```
hump-search/
├── app/
│   ├── admin/           # Admin interface for indexing content
│   ├── search/          # Member-facing search page (embeddable)
│   └── api/
│       ├── index/       # Generate summary, create embedding, save to index
│       ├── search/      # Semantic search + Claude recommendation
│       └── content/     # CRUD operations on indexed content
├── lib/
│   ├── embeddings.ts    # OpenAI embedding generation + cosine similarity
│   ├── summarise.ts     # Claude summary generation with system prompt
│   └── storage.ts       # Vercel Blob read/write operations
├── spec.md
└── package.json
```

---

## Future Considerations

- **Content growth:** Architecture handles thousands of items without changes. If the library grows significantly, a lightweight vector database (e.g., Turso with SQLite) could replace the JSON file.
- **Analytics:** Track what members search for to identify content gaps.
- **Category browsing:** Complement search with curated category views.
- **Feedback loop:** Allow members to rate recommendations to improve summaries over time.
