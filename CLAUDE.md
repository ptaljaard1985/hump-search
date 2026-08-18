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
- **Storage:** Supabase Postgres (with pgvector for embeddings)
- **Embeddings:** OpenAI `text-embedding-3-small`
- **LLM:** Claude Sonnet (search + summaries), Claude Opus (infographic summaries only)
- **Language:** TypeScript

## Key Architecture Decisions

- Two-stage search *as designed*: vector similarity narrows to a shortlist, Claude recommends from those. `findSimilarContent()` defaults to `topK = 6`, `minSimilarity = 0.25` — do not confuse this with the 8-item **result cap** below, which limits what Claude returns, not what it sees.
- **As shipped, stage 1 is not wired up** — `/api/search` sends the whole index (216 items) to Claude in one prompt. `findSimilarContent()` in `embeddings.ts` is uncalled. Embeddings are still generated and stored on index/update, so stage 1 can be reconnected without a re-embed. See `spec.md` → "As-built differences".
- All Claude calls use `temperature: 0`. This is load-bearing, not cosmetic — it is why the same query returns the same results. It also constrains model choice: current-generation models reject the parameter outright (see Model Choice below).
- Claude never searches or recalls from training data — it only sees items passed to it from the verified index
- Anti-hallucination: Claude can only recommend from items explicitly passed to it
- Summaries are use-case-oriented (describe when an adviser would use the content, not academic descriptions)
- Search results formatted as markdown with linked titles, type badges, and brief explanations
- **Result cap: 8 items**, enforced in the search system prompt, with `max_tokens: 2000` for headroom. Both matter together: without the cap Claude returns 15–19 items and truncates mid-link. Measured at ~580 output tokens for a capped answer. If you change the cap, re-check `max_tokens`.
- **Closing note allowed on a genuine gap:** Claude may end with one sentence naming something the member wanted that the library does not cover, so it reads as missing rather than overlooked. It must not write a closing summary that repeats the recommendations, and must not use the sentence as a sign-off. In testing this fired only where a real gap existed.

## Model Choice

- **Search: `claude-sonnet-4-6` (`src/lib/search.ts`). This is a tested decision, not an unreviewed default — do not "upgrade" it without re-running the comparison.** Benchmarked against Sonnet 5 and Haiku 4.5 on the five most recent real member queries, 18 August 2026. Full outputs in `scripts/model-comparison-2026-08-18.md`.
  - **Haiku 4.5** is 3x cheaper and was rejected: it returns false negatives on short queries, reporting no cashflow content when three relevant articles existed. 46% of real member queries are one or two words, so this is not an edge case. It is also poorly calibrated in the other direction, returning 16 items on the queries it did answer.
  - **Sonnet 5** was rejected on two counts: it rejects `temperature: 0` with a 400 (`` `temperature` is deprecated for this model ``), breaking the determinism rule above; and its tokenizer inflates the same prompt from 61,571 to 93,408 tokens, making it ~45% more expensive than Sonnet 4.6 from 1 September 2026 when introductory pricing ends. It is genuinely faster and better calibrated on item count, so revisit if the determinism rule is ever relaxed.
- **Indexing: `claude-opus-4-6` for infographics, `claude-sonnet-4-6` for everything else (`src/lib/summarise.ts`).** These were **not** covered by the comparison above, which tested search only. Changing them affects new summaries only — existing summaries were written by the current models, so a switch leaves the index stylistically inconsistent unless you re-summarise everything.

## Language Rules

- Always use UK English spelling (behaviour, organise, colour, etc.)
- Always use "adviser" — never "advisor"
- Exception: the type value `advisor-doc` is stored in the database and in the `ContentType` union. Leave it alone — renaming it would require a data migration. Prose and member-facing text always say "adviser".
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
      search-logs/      # Fetch search logs (admin)
      content/          # CRUD operations on indexed content
      backup/           # Download full index as JSON backup file
      keepalive/        # Daily cron — touches content_items
      keepalive-search/ # Daily cron — touches search_logs
  lib/
    types.ts       # ContentItem, SearchResult types
    embeddings.ts  # OpenAI embedding generation + cosine similarity
    summarise.ts   # Claude summary generation with system prompt
    search.ts      # Claude recommendation from search candidates
    storage.ts     # Supabase Postgres read/write
    auth.ts        # Simple password check
public/
  widget.js        # Embeddable widget (not currently in use)
scripts/
  migrate-to-supabase.ts  # One-time migration from Vercel Blob backup JSON
  reembed-all.ts          # Regenerate embeddings for every item
  compare-models.ts       # A/B two models over sample queries -> comparison-results.md
  test-supabase.ts        # Connection test (insert, read, delete)
vercel.json               # Keepalive cron schedules
```

## Environment Variables

```
OPENAI_API_KEY=         # For embeddings only
ANTHROPIC_API_KEY=      # For summary generation + member search
ADMIN_PASSWORD=         # Simple password protection for admin
SUPABASE_URL=           # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=  # Supabase service role key (not anon)
CRON_SECRET=            # Optional; if set, keepalive crons require Bearer auth
```

`.env.local` is read directly by the scripts in `scripts/` as well as by Next.js.

## Commands

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — lint check

## Storage Safety Rules

- **Atomic row operations:** Each add, update, and delete is a single database operation — no read-modify-write cycles.
- **Build before write:** When indexing content, generate the summary and embedding before inserting into the database. If generation fails, the database stays untouched.
- **Manual backup:** Admin UI has a "Download Backup" button (hits `/api/backup`) to export the full index including embeddings as JSON.
- **No silent error swallowing:** All storage functions must throw on database errors, never silently return empty results.
- **Duplicate detection:** `checkDuplicate` uses two separate `.ilike()` queries (not `.or()` with string interpolation) to safely match titles/URLs (normalised: trim, lowercase, strip trailing slashes) before inserting.
- **Supabase project:** `bfjsvzdipbxngfyaxaqo.supabase.co` (free tier) — tables: `content_items` (with pgvector `VECTOR(1536)` embedding column), `search_logs` (query logging).
- **Search logging:** Every member search is logged to `search_logs` (query, result_count, timestamp). Viewable in admin UI under "Search Logs".
- **Keepalive:** Supabase free tier auto-pauses when idle. Pausing is **project-level**, so `/api/keepalive` (09:00 UTC, a `count` on `content_items`) alone is sufficient to keep the project awake. `/api/keepalive-search` (10:00 UTC) is a **canary**, not a keepalive: it exercises the full search path end-to-end. It sends only `CANARY_ITEM_COUNT` (5) items to Claude, not the whole index, and does **not** write a row to `search_logs` — member search history stays clean.

## Conventions

- Keep it simple — minimal dependencies, no over-engineering
- Prefer server components where possible
- API routes handle all LLM and embedding calls server-side
- No client-side exposure of API keys
- API clients initialised lazily (not at module level) to avoid build errors
- Supabase client uses `cache: "no-store"` on all fetch calls to prevent Next.js App Router from caching database reads
- All API routes must have try/catch with meaningful error responses

## Known Issues

- **Squarespace embedding not working.** Multiple approaches failed: iframe blocked by Vercel's `X-Frame-Options`, inline JS mangled by Squarespace smart quotes, external scripts not executed in code blocks. Current workaround is a button linking to the standalone search page. Worth one more attempt: `middleware.ts` now clears `X-Frame-Options` and sets `frame-ancestors` for the Squarespace domains, which was the original blocker.
- **Admin password protection temporarily removed** (see commit `4ec50bd`).
- **No videos indexed.** `spec.md` allows for 5; the index has 0. The only content type entirely absent.
- **Stage 1 vector search not wired up** — see Key Architecture Decisions. Not a bug: deliberate at current volume (~36 searches/month, $87/year). Reconsider past ~250/month. Reconnection notes in `spec.md` → "Reconnecting stage 1".
