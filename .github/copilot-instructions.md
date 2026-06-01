# Copilot instructions

Start With Local AI is a choose-your-own-adventure web app (React + Vite +
TypeScript, CSS Modules, Vitest) that guides newcomers through installing and
running local AI tools (Ollama, LM Studio, llama.cpp, vLLM, SGLang).

## Commands

| Task | Command |
| --- | --- |
| Dev server (http://localhost:5173) | `npm run dev` |
| Type-check + production build | `npm run build` (runs `tsc` then `vite build`) |
| Run all tests once | `npm test` |
| Watch tests | `npm run test:watch` |
| Run a single test file | `npx vitest run src/test/storage.test.ts` |
| Run tests matching a name | `npx vitest run -t "schema mismatch"` |

There is no ESLint/Prettier setup; type-checking via `tsc` (in `npm run build`)
is the only static check.

## Architecture

The entire tutorial is **data, not code**. Information (what to show) lives in a
**catalog**; a **builder** turns it into the story graph the UI renders generically.
This separation is what makes adding tools/OSes/hardware a pure data edit. Read these
together:

- `src/content/types.ts` — core graph types: `StoryNode`, `Choice`, `ContentBlock`
  (discriminated union: paragraph/heading/list/code/callout/link), `AdventureFacts`
  (`reason`/`level`/`useCase`/`os`/`hardware`/`tool`), `OS`/`UseCase`/`Tool`/`Hardware`
  unions, and `START_NODE`.
- `src/content/catalog/` — **the information layer (data).**
  - `catalog/types.ts` — `UseCaseDef`, `OSDef`, `HardwareDef`, `ToolDef` (with
    `useCases`, `supports(ctx)`, `install(ctx)`, and shared `steps`), `PathContext`
    (`useCase`/`os`/`hardware`), and `EXPLORE_TARGET`.
  - `catalog/usecases.ts` — `useCases` (chat / image-video / coding). Each tool is
    tagged with the `useCases` it serves; only those paths offer it.
  - `catalog/os.ts` — `operatingSystems` and `hardwareProfiles`. An `OSDef.hardware`
    list (Windows/Linux) inserts a hardware-selection step; omit it to skip to tools.
  - `catalog/tools/*.ts` — one `ToolDef` per tool. `catalog/index.ts` lists them and
    exposes `toolsFor(ctx)`, `enumerateContexts()`, `selectableHardwareFor(useCase, os)`.
- `src/content/build.ts` — `buildStory()` generates the graph: `choose-usecase` →
  `choose-os-{useCase}` → `choose-hw-{useCase}-{os}` (when applicable) →
  `choose-tool-{useCase}-{os}[-{hw}]` → `{tool}-{ctx}-install` → shared `{tool}-{slug}`
  steps. `ctxKey` is `{useCase}-{os}[-{hardware}]`. Empty contexts are filtered out;
  upstream choices clear downstream facts.
- `src/content/fixed.ts` — the only hand-written nodes: `intro`, `why-local`,
  `choose-level` (which routes to the generated `choose-usecase`).
- `src/content/story.ts` — `story = buildStory()`; runs the validator in DEV.
- `src/content/validate.ts` — graph validator: every `next`/`choice.to` target exists,
  non-terminal nodes have a way forward, all nodes reachable from `START_NODE`.
  Asserted by `src/test/{build,validate}.test.ts`.
- `src/state/adventure.ts` — a **pure reducer** (`adventureReducer`) plus
  `initState`/`toPersisted`. Choosing a new branch after stepping back discards the
  now-divergent "future" portion of the path.
- `src/state/useAdventure.ts` — wires the reducer to persistence and the document
  `data-theme`; guards against a persisted `currentNodeId` missing from the graph by
  resetting to `START_NODE`.
- `src/state/storage.ts` — versioned `localStorage` layer (key `swla:v1`,
  `SCHEMA_VERSION`).
- `src/components/` — presentational components (`NodeView`, `Breadcrumb`,
  `Controls`, `ThemeToggle`, `ContentBlocks/`) consuming `useAdventure`.

## Conventions

- **Extend the catalog, not the graph.** Add a tool via a `ToolDef` in
  `catalog/tools/` (+ list it in `catalog/index.ts`); add a use case via `UseCaseDef`
  in `catalog/usecases.ts`; add an OS/hardware via `OSDef`/`HardwareDef` in
  `catalog/os.ts`. Do NOT hand-write per-(useCase×tool×OS×hardware) nodes —
  the builder generates them. A tool declares which `useCases` it serves and which
  contexts it `supports`; the builder only offers it where supported and filters out
  empty contexts.
- **Content uses `ContentBlock` unions, not raw HTML/JSX.** Body content is an
  array of structured blocks; add a new block type by extending the union in
  `types.ts` and handling it in `components/ContentBlocks/`.
- **Keep `adventureReducer` pure.** New behaviors are new action types handled in
  the reducer; components dispatch via the `useAdventure` API rather than mutating
  state directly.
- **Persistence is resilient and versioned.** `loadState`/`saveState` fail
  silently and fall back to defaults; the theme preference is preserved across
  resets and schema mismatches. Bump `SCHEMA_VERSION` when changing the persisted
  shape **or the node-id scheme** (the builder's ids), so returning users do not
  land on a removed node.
