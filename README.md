# HUM Content Search

AI-powered semantic search over the HUM Premium content archive — six years of
behavioural finance resources for financial advisers.

A member describes their situation in plain language ("client panicking about a
market drop") and gets back a short, linked list of the most useful articles,
adviser documents, infographics, PDF guides and email sequences, each with a
sentence on why it fits.

There is also a password-protected admin interface for indexing new content,
with AI-generated summaries.

- **Search (members):** `/search` — linked from Squarespace
- **Admin:** `/admin`
- **Live:** `hump-search-git-main-pierre-simplewealths-projects.vercel.app`
- **Squarespace site:** `humansundermanagement.com`

See `spec.md` for the product specification and `CLAUDE.md` for working
conventions.

---

## How it works

1. Member submits a natural language query.
2. The API loads the content index from Supabase.
3. Query plus candidate items (title, type, summary, URL) go to Claude.
4. Claude selects the best matches, groups them by content type, and explains
   each one.
5. Every URL in Claude's reply is checked against the index before display —
   anything not found is stripped.

**Anti-hallucination:** Claude never searches its own training data. It only
ever sees items retrieved from the verified index, the system prompt forbids
inventing titles or URLs, and the response is URL-verified server-side.

All Claude calls use `temperature: 0`. Nothing here benefits from randomness.

> **Note on retrieval.** Embeddings are generated and stored for every item,
> but the search route currently sends the **whole index** to Claude rather
> than pre-filtering by vector similarity. `findSimilarContent()` in
> `src/lib/embeddings.ts` is not called by anything. See "Known drift" below.

---

## Tech stack

| Component | Tool |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript |
| Hosting | Vercel (free tier) |
| Database | Supabase Postgres + pgvector |
| Embeddings | OpenAI `text-embedding-3-small` (1536 dims) |
| Summaries | Claude — Opus for infographics, Sonnet for everything else |
| Search responses | Claude Sonnet |

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Create `.env.local`:

```
OPENAI_API_KEY=             # embeddings only
ANTHROPIC_API_KEY=          # summaries + member search
ADMIN_PASSWORD=             # admin interface
SUPABASE_URL=               # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=  # service role key, not anon
CRON_SECRET=                # optional; if set, keepalive crons require it
```

`.env.local` is also read directly by the scripts in `scripts/`.

### Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint check |

---

## Content types

| Type value | Input method | Summary model |
|---|---|---|
| `article` | Paste text | Sonnet |
| `advisor-doc` | Paste text | Sonnet |
| `infographic` | Upload image | Opus |
| `pdf-guide` | Upload PDF | Sonnet |
| `video` | Paste description | Sonnet |
| `email-sequence` | Paste all emails as one | Sonnet |

House style is "adviser", never "advisor" — but the type value `advisor-doc` is
stored in the database and in the `ContentType` union, so it stays as-is.
Use "adviser" in all prose and member-facing text.

---

## Project structure

```
src/
  middleware.ts             # Strips X-Frame-Options, sets CSP frame-ancestors for /search
  app/
    admin/                  # Admin interface for indexing
    search/                 # Member-facing search page
    api/
      index-content/        # Generate summary + embedding, save to index
      generate-summary/     # Generate summary only (preview before saving)
      search/               # Member search + Claude recommendation
      search-logs/          # Fetch search logs (admin)
      content/              # CRUD on indexed content
      backup/               # Download full index as JSON, including embeddings
      keepalive/            # Daily cron — touches content_items
      keepalive-search/     # Daily cron — touches search_logs
  lib/
    types.ts                # ContentType, ContentItem, SearchResult
    embeddings.ts           # OpenAI embeddings, cosine similarity
    summarise.ts            # Claude summary generation + system prompt
    search.ts               # Claude recommendation from candidates
    storage.ts              # Supabase reads/writes
    auth.ts                 # Password check
public/
  widget.js                 # Embeddable widget (not currently in use)
scripts/
  migrate-to-supabase.ts    # One-time migration from the Blob backup JSON
  reembed-all.ts            # Regenerate embeddings for every item
  compare-models.ts         # A/B two models over sample queries
  test-supabase.ts          # Connection test — inserts, reads, then deletes
```

---

## Database

Supabase project `bfjsvzdipbxngfyaxaqo` (free tier).

- **`content_items`** — one row per item, with a `VECTOR(1536)` embedding column.
- **`search_logs`** — every member search: query, result count, timestamp.
  Viewable in the admin UI.

### Storage safety rules

- **Atomic row operations.** Every add, update and delete is a single database
  operation. No read-modify-write cycles.
- **Build before write.** Summary and embedding are generated *before* the
  insert. If generation fails, the database is untouched.
- **No silent failures.** Storage functions throw on database errors. They never
  return an empty result to paper over a failure.
- **Duplicate detection.** `checkDuplicate` runs two separate `.ilike()` queries
  (not `.or()` with string interpolation) against normalised titles and URLs.
- **No Next.js caching.** The Supabase client sets `cache: "no-store"` on all
  fetches so the App Router cannot serve stale reads.
- **Manual backup.** "Download Backup" in the admin UI hits `/api/backup` and
  exports the full index, embeddings included.

### Keepalive

Supabase free-tier projects auto-pause when idle. Pausing is **project-level**,
so a single touch of any table keeps the whole project awake.

| Cron | Schedule (UTC) | Purpose |
|---|---|---|
| `/api/keepalive` | 09:00 daily | The actual keepalive — a `count` on `content_items`. No Claude call, no cost. |
| `/api/keepalive-search` | 10:00 daily | A **canary**, not a keepalive. Runs the search path end-to-end so a broken API key, a failed deploy, or a Supabase outage surfaces before a member hits it. |

The canary sends only `CANARY_ITEM_COUNT` (5) items to Claude rather than the
whole index — the smoke test needs a well-formed response, not a good one, and
sending everything cost ~14x more for no extra signal. It reads `search_logs`
rather than writing to it, so member search history is not polluted with
synthetic rows.

If `CRON_SECRET` is set, both require a matching `Authorization: Bearer` header.

---

## Known drift

Recorded so it is not rediscovered later. None of this is broken in production;
it is a gap between what the docs promised and what the code does.

- **Vector search is not wired up.** `spec.md` describes a two-stage search
  where cosine similarity narrows to a handful of candidates before Claude sees
  them. The search route instead sends the entire index to Claude in one prompt.
  `findSimilarContent()` and `cosineSimilarity()` are effectively dead code.
  Embeddings are still generated and stored on every index and update, so the
  data is there whenever stage one is reconnected.
- **Cost follows from the above.** Each search is a large prompt (roughly 34k
  input tokens when the library was 117 items) rather than a small one.
- **No videos indexed.** The spec allows for five; the index has none.
- **Model IDs.** `src/lib/search.ts` and `src/lib/summarise.ts` pin
  `claude-sonnet-4-6` and `claude-opus-4-6`. Newer models are available. Any
  upgrade should be deliberate, since existing summaries were written by the
  current ones.

## Known issues

- **Squarespace embedding.** Not working. iframes were blocked by Vercel's
  `X-Frame-Options`, inline JS was mangled by Squarespace smart quotes, and
  external scripts do not execute in code blocks. Current workaround: a plain
  button linking to the standalone search page. `middleware.ts` now clears
  `X-Frame-Options` and sets `frame-ancestors` for the Squarespace domains, so
  an iframe may be worth retrying.
- **Admin password protection** was temporarily removed (commit `4ec50bd`).
