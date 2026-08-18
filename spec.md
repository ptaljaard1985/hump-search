# HUM Content Search — Product Specification

## Overview

A self-built AI-powered search tool that allows HUM Premium members to find the right content from a 6-year archive of evergreen behavioural finance resources. Members describe their situation in natural language and receive targeted content recommendations with direct links.

The tool also includes an admin interface for indexing content, with AI-powered summary generation.

---

## Status

**As built, last verified 18 August 2026.** This document is the product
specification; where the shipped system differs, the difference is called out
inline and collected under "As-built differences" at the end.

Live index: **216 items** — 117 articles, 48 infographics, 42 adviser documents,
6 PDF guides, 3 email sequences, 0 videos. 300 searches logged to date.

---

## Architecture

### Approach: Two-Stage Semantic Search

1. **Stage 1 — Vector search (cheap, fast):** Member query is converted to an embedding and matched against pre-computed content embeddings using cosine similarity. Returns top 8–10 candidates.
2. **Stage 2 — Claude recommendation (intelligent):** The 8–10 candidate summaries are passed to Claude Sonnet with the member's query. Claude selects the best 3–5 matches and explains why each is relevant.

> **Not currently how it runs.** Stage 1 is not wired into the search route.
> `/api/search` loads the whole index and passes every item to Claude in a
> single prompt. `findSimilarContent()` in `src/lib/embeddings.ts` (top-K 6,
> minimum similarity 0.25) exists but nothing calls it. Embeddings are still
> generated and stored on every index and update, so stage 1 can be reconnected
> without a re-embed.

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
| Storage | Supabase Postgres + pgvector | Stores content items and embeddings |
| Embeddings | OpenAI `text-embedding-3-small` | Converts summaries to vectors |
| Summary generation | Claude Sonnet (articles, docs, PDFs, videos, sequences) / Claude Opus (infographics) | AI-powered content summarisation during indexing |
| Member search responses | Claude Sonnet | Generates natural language recommendations |

### API Keys Required

- OpenAI (embeddings only)
- Anthropic (summary generation + member search)

---

## Content Inventory

| Content Type | Type value | Planned | Indexed | Input Method | Model | Indexed As |
|---|---|---|---|---|---|---|
| Client articles | `article` | 120 | 117 | Paste text | Sonnet | Individual |
| Adviser documents | `advisor-doc` | 40 | 42 | Paste text | Sonnet | Individual |
| Infographics | `infographic` | ~40 | 48 | Upload image | Opus | Individual |
| PDF guides | `pdf-guide` | 6 | 6 | Upload PDF | Sonnet | Individual |
| Videos | `video` | 5 | 0 | Paste description | Sonnet | Individual |
| Email sequences | `email-sequence` | 3 | 3 | Paste all emails as one | Sonnet | Per sequence |
| **Total** | | **~214** | **216** | | | |

House style is "adviser", never "advisor". The type value `advisor-doc` is the
one exception: it is stored in the database and in the `ContentType` union, so
it stays as it is. Prose and member-facing text always say "adviser".

### Notes on Content

- All content lives on the Squarespace member portal
- Each article has an accompanying sketch — these are not indexed separately but can be referenced alongside their parent article
- Email sequences are indexed as one item per sequence (not per individual email)
- Video descriptions are written manually (not worth automating transcription from Vimeo). None are indexed yet.

---

## Admin Tool

**URL:** `/admin` (password-protected)

**Users:** Pierre and assistant

### Indexing Flow

1. Select content type from dropdown
2. Enter title and Squarespace URL
3. Input content:
   - **Articles, adviser docs, email sequences:** Paste text
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
2. Candidate items are gathered from the index (see the stage 1 note above — at
   present this is the whole index, not a vector-narrowed subset)
3. Those items (title, URL, summary, type) are sent to Claude Sonnet with the query
4. Claude returns **at most 8 items**, grouped by content type, with:
   - Content title
   - Content type label
   - Why it's relevant to their situation
   - Direct link to the content on Squarespace

### Edge Cases

- **No good matches:** Claude responds with a helpful message suggesting they browse by category or rephrase their query
- **Many good matches:** the system prompt caps output at 8 items and instructs Claude to pick the 8 strongest. Before 18 August 2026 there was no cap — Claude returned 15–19 items and responses were silently truncated mid-link at `max_tokens: 1200`.
- **Partial gap in the library:** Claude may close with a single sentence naming what the member seems to want but the library does not hold. This doubles as a content-gap signal worth reviewing periodically.
- **URL verification:** Frontend checks all returned URLs exist in the content index before displaying

---

## Data Model

One row per item in `content_items`. `embedding` is a pgvector `VECTOR(1536)`
column and is excluded from the payload sent to Claude.

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
| Supabase Postgres | Free tier |
| Claude search queries (500 queries/mo) | ~$10 |
| Claude search queries (1,750 queries/mo) | ~$35 |
| New content indexing | Negligible |

These estimates assumed stage 1 narrowing to 8–10 items. Because the whole index
is currently sent on every search, the real input-token cost per query is
substantially higher — a sample run at 117 items measured ~34k input tokens.
Worth re-estimating before any volume increase.

---

## Project Structure

```
hump-search/
├── src/
│   ├── middleware.ts            # Clears X-Frame-Options, sets CSP for /search
│   ├── app/
│   │   ├── admin/               # Admin interface for indexing content
│   │   ├── search/              # Member-facing search page
│   │   └── api/
│   │       ├── index-content/   # Generate summary + embedding, save to index
│   │       ├── generate-summary/# Generate summary only (preview)
│   │       ├── search/          # Member search + Claude recommendation
│   │       ├── search-logs/     # Fetch search logs (admin)
│   │       ├── content/         # CRUD operations on indexed content
│   │       ├── backup/          # Export full index as JSON
│   │       ├── keepalive/       # Daily cron — touches content_items
│   │       └── keepalive-search/# Daily cron — touches search_logs
│   └── lib/
│       ├── types.ts             # ContentType, ContentItem, SearchResult
│       ├── embeddings.ts        # OpenAI embeddings + cosine similarity
│       ├── summarise.ts         # Claude summary generation with system prompt
│       ├── search.ts            # Claude recommendation from candidates
│       ├── storage.ts           # Supabase read/write operations
│       └── auth.ts              # Password check
├── public/widget.js             # Embeddable widget (not currently in use)
├── scripts/                     # Migration, re-embed, model comparison, tests
├── vercel.json                  # Keepalive cron schedules
├── spec.md
├── README.md
└── package.json
```

---

## Future Considerations

- **Content growth:** Storage is already Postgres with pgvector, so the index scales well past the current 216 items. The binding constraint is the search prompt, not storage — see stage 1 below.
- **Analytics:** Track what members search for to identify content gaps.
- **Category browsing:** Complement search with curated category views.
- **Feedback loop:** Allow members to rate recommendations to improve summaries over time.

---

## As-built differences

Differences between this specification and the shipped system, verified
18 August 2026. Nothing here is broken in production.

| Area | Spec | As built |
|---|---|---|
| Storage | Vercel Blob JSON index | Supabase Postgres with pgvector |
| Stage 1 retrieval | Cosine similarity narrows to top 8–10 | Not wired up; whole index sent to Claude |
| `findSimilarContent()` | Core of stage 1 | Present but uncalled (top-K 6, min similarity 0.25) |
| Result count | 3–5 items | Capped at 8 in the system prompt (18 Aug 2026); grouped by type |
| Videos | 5 indexed | 0 indexed |
| Search logging | Listed as a future analytics idea | Built — `search_logs` table, admin UI |
| Keepalive | Not specified | Two daily Vercel crons keep Supabase awake |
| Embedding | Summary only | `buildEmbeddingText(title, type, summary)` |

### Reconnecting stage 1

Embeddings are populated for all 216 items, so this is a search-route change
only, with no re-embed required:

1. Embed the member query with `generateEmbedding()`.
2. Pass the query embedding and items to `findSimilarContent()`.
3. Send the returned subset to `getRecommendations()` instead of all items.

Tune `topK` and `minSimilarity` before switching — the defaults (6 and 0.25)
have never run against live queries. Worth A/B-ing against current behaviour
using `scripts/compare-models.ts` as a harness, since sending everything does
produce good results today and is the reason the shortcut has held.
