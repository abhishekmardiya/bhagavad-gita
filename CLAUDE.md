@AGENTS.md

# Keep the docs in sync with the code

`README.md` and this file are part of the deliverable, not an afterthought. Whenever a change makes something they say wrong or incomplete, update them **in the same change** — never as a follow-up task.

Update `README.md` when a change touches any of:

- **Setup or environment** — new/renamed env vars (also update `env-sample.txt`), Node or dependency version floors, install steps.
- **Scripts** — anything added, removed, or renamed in the `scripts` block of `package.json` belongs in the Scripts table.
- **Routing or URLs** — new routes, locale handling, redirects, or changes to `src/proxy.ts`.
- **Data sources** — a different API, new endpoints, changed caching/revalidation, or a change to what is fetched vs. hardcoded.
- **Architecture** — new top-level directories, a moved or renamed file that README links to, or a change to how rendering works (SSG/SSR/streaming).
- **Behaviour the README describes** — if a documented claim ("nothing is machine-translated", which fields render per locale, etc.) stops being true, fix the prose, not just the code.

README links to source files with relative paths (e.g. `[src/proxy.ts](src/proxy.ts)`). If you move or rename a file, fix the links that point to it.

Update `CLAUDE.md` / `AGENTS.md` when a change alters how future work should be done: new conventions, a new tool in the stack, a directory whose purpose isn't obvious, or a gotcha that cost time to discover. Do not restate what the code or `README.md` already makes clear — these files are for guidance that isn't derivable from reading the repo.

Leave the `<!-- BEGIN:nextjs-agent-rules -->` block in `AGENTS.md` alone; `next dev` regenerates it.

If a change genuinely affects neither file, say so explicitly rather than silently skipping the check.
