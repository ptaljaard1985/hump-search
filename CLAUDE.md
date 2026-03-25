# HUM Content Search

## Project Overview

AI-powered semantic search tool for HUM Premium members to find content from a 6-year archive of behavioural finance resources. See `spec.md` for full specification.

## Deployment

- **URL:** `hump-search-git-main-pierre-simplewealths-projects.vercel.app`
- **Admin:** `/admin` (password-protected)
- **Search:** `/search` (member-facing, linked from Squarespace via button)
- **Squarespace site:** `humansundermanagement.com`

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Hosting:** Vercel (free tier)
- **Storage:** Vercel Blob (content index JSON, with auto-backup)
- **Embeddings:** OpenAI `text-embedding-3-small`
- **LLM:** Claude Sonnet (search + summaries), Claude Opus (infographic summaries only)
- **Language:** TypeScript

## Key Architecture Decisions

- Two-stage search: vector similarity narrows to top 8–10, Claude recommends from those
- All Claude calls use `temperature: 0`
- Claude never sees the full content library — only retrieved candidates
- Anti-hallucination: Claude can only recommend from items explicitly passed to it
- Summaries are use-case-oriented (describe when an adviser would use the content, not academic descriptions)
- Search results formatted as markdown with linked titles, type badges, and brief explanations

## Language Rules

- Always use UK English spelling (behaviour, organise, colour, etc.)
- Always use "adviser" — never "advisor"
- These rules are enforced in both the indexing and search system prompts

## Content Types and Indexing

| Type | Input Method | Model |
|---|---|---|
| Client articles | Paste text | Sonnet |
| Adviser documents | Paste text | Sonnet |
| Infographics | Upload image (any format) | Opus |
| PDF guides | Upload PDF | Sonnet |
| Videos | Paste description | Sonnet |
| Email sequences | Paste all emails as one | Sonnet |

## Project Structure

```
src/
  middleware.ts    # CORS/iframe headers (currently for /search)
  app/
    admin/         # Password-protected admin interface for indexing
    search/        # Member-facing search page
    api/
      index-content/    # Generate summary + embedding, save to index
      generate-summary/ # Generate summary only (preview before saving)
      search/           # Semantic search + Claude recommendation
      content/          # CRUD operations on indexed content
      backup/           # Download full index as JSON backup file
  lib/
    types.ts       # ContentItem, SearchResult types
    embeddings.ts  # OpenAI embedding generation + cosine similarity
    summarise.ts   # Claude summary generation with system prompt
    search.ts      # Claude recommendation from search candidates
    storage.ts     # Vercel Blob read/write with auto-backup
    auth.ts        # Simple password check
public/
  widget.js        # Embeddable widget (not currently in use)
```

## Environment Variables

```
OPENAI_API_KEY=         # For embeddings only
ANTHROPIC_API_KEY=      # For summary generation + member search
ADMIN_PASSWORD=         # Simple password protection for admin
BLOB_READ_WRITE_TOKEN=  # Vercel Blob access (auto-set by Vercel)
```

## Commands

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — lint check

## Storage Safety Rules

- **Single read-modify-write:** Every index mutation (add, replace, update, delete) must read the index, modify it in memory, and save once. Never do two separate read-modify-write cycles for one logical operation.
- **Build before write:** When indexing content, generate the summary and embedding before touching the index. If generation fails, the index stays untouched.
- **Auto-backup:** `saveContentIndex` backs up the *current* blob state before overwriting. Keeps the last 5 backups in `backups/content-index-*.json`.
- **Manual backup:** Admin UI has a "Download Backup" button (hits `/api/backup`) to export the full index including embeddings.
- **Vercel Blob config:** Always use `addRandomSuffix: false` + `allowOverwrite: true` for the main index blob. Never use `addRandomSuffix: true` — it changes the filename so `list({ prefix })` can't find it.
- **No silent error swallowing:** `getContentIndex` must throw on fetch failures, never silently return `{ items: [] }`. Only return empty when zero blobs exist (genuinely empty index).
- **Duplicate detection:** `index-content` normalises titles and URLs (trim, lowercase, strip trailing slashes) before comparing. This prevents near-duplicates from bypassing the check.

## Conventions

- Keep it simple — minimal dependencies, no over-engineering
- Prefer server components where possible
- API routes handle all LLM and embedding calls server-side
- No client-side exposure of API keys
- API clients initialised lazily (not at module level) to avoid build errors
- All API routes must have try/catch with meaningful error responses

## Known Issues

- Squarespace embedding not working — multiple approaches failed (iframe blocked by Vercel X-Frame-Options, inline JS mangled by Squarespace smart quotes, external scripts not executed in code blocks). Current workaround: button link to standalone search page.
- Admin password protection temporarily removed (see commit 4ec50bd)
