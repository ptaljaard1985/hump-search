# HUM Content Search

## Project Overview

AI-powered semantic search tool for HUM Premium members to find content from a 6-year archive of behavioural finance resources. See `spec.md` for full specification.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Hosting:** Vercel
- **Storage:** Vercel Blob
- **Embeddings:** OpenAI `text-embedding-3-small`
- **LLM:** Claude Sonnet (search + summaries), Claude Opus (infographic summaries only)
- **Language:** TypeScript

## Key Architecture Decisions

- Two-stage search: vector similarity narrows to top 8–10, Claude recommends from those
- All Claude calls use `temperature: 0`
- Claude never sees the full content library — only retrieved candidates
- Anti-hallucination: Claude can only recommend from items explicitly passed to it
- Summaries are use-case-oriented (describe when an adviser would use the content, not academic descriptions)

## Project Structure

```
app/
  admin/          # Password-protected admin interface for indexing
  search/         # Member-facing search page (embeddable in Squarespace)
  api/
    index/        # Generate summary, create embedding, save to index
    search/       # Semantic search + Claude recommendation
    content/      # CRUD operations on indexed content
lib/
  embeddings.ts   # OpenAI embedding generation + cosine similarity
  summarise.ts    # Claude summary generation with system prompt
  storage.ts      # Vercel Blob read/write operations
```

## Environment Variables

```
OPENAI_API_KEY=         # For embeddings only
ANTHROPIC_API_KEY=      # For summary generation + member search
ADMIN_PASSWORD=         # Simple password protection for admin
BLOB_READ_WRITE_TOKEN=  # Vercel Blob access
```

## Commands

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — lint check

## Conventions

- Keep it simple — minimal dependencies, no over-engineering
- Prefer server components where possible
- API routes handle all LLM and embedding calls server-side
- No client-side exposure of API keys
