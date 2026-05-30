# Start With Local AI

A build-your-own-adventure web app that guides newcomers through getting started
with **local AI**. Inspired by the choose-your-own-adventure books of old, but
combined with modern tooling — your choices are saved in `localStorage`, so you can
leave and resume exactly where you left off.

The journey opens with a short introduction to today's local-AI options and asks
*why* you want to run AI locally instead of in the cloud. From there it branches on
your **technical level** (Beginner / Advanced) and **operating system**
(Windows / macOS / Linux), then walks you through real install-and-first-run
tutorials for **Ollama**, **LM Studio**, and **llama.cpp**.

## Features

- 📖 Choose-your-own-adventure flow built on a data-driven story graph
- 💾 Progress, full choice history, and theme persisted in `localStorage`
- 🧭 Linear back/forward navigation with a clickable breadcrumb path map
- ♻️ One-click "Start over" reset (keeps your theme preference)
- 🌗 Retro "gamebook" styling with a light/dark theme toggle
- ✅ Validated story graph (no dead ends or broken links) + unit tests

## Tech stack

React + Vite + TypeScript, plain CSS Modules, Vitest for unit tests.

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
```

## Scripts

| Command              | What it does                              |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Start the Vite dev server with hot reload |
| `npm run build`      | Type-check (`tsc`) and build to `dist/`   |
| `npm run preview`    | Preview the production build locally      |
| `npm test`           | Run the Vitest unit-test suite once       |
| `npm run test:watch` | Run tests in watch mode                   |

## Project structure

```
src/
  content/     Story graph: types, nodes per tool, and the graph validator
  state/       Adventure reducer, useAdventure hook, localStorage layer
  components/   NodeView, Breadcrumb, Controls, ThemeToggle, ContentBlocks
  styles/      Global styles and theme variables
  test/        Vitest unit tests
```

### Adding to the adventure

The whole tutorial is data. To add a path, add `StoryNode`s to a file in
`src/content/` and reference them from a choice's `to`. The graph is validated in
development (and by `src/test/validate.test.ts`), so broken links and dead ends are
caught early.
