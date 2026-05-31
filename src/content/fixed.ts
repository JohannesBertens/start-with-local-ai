import type { Story } from './types';

/**
 * The fixed lead-in nodes that precede the data-driven (catalog-built) portion
 * of the adventure. These do not multiply with tools/OSes/hardware, so they stay
 * hand-written. `choose-level` hands off to the generated `choose-os` node.
 */
export const fixedNodes: Story = {
  intro: {
    id: 'intro',
    title: 'Welcome, traveler',
    body: [
      {
        type: 'paragraph',
        text: 'Running AI models on your own machine — "local AI" — has gone from a hobbyist curiosity to something anyone can do in a few minutes. No subscriptions, no sending your data to someone else\'s server, and it keeps working when the Wi-Fi does not.',
      },
      {
        type: 'paragraph',
        text: 'This is a build-your-own adventure. You make the choices; we assemble a tutorial that fits your machine and your comfort level. Your progress is saved in your browser, so you can wander off and come back to exactly where you left.',
      },
      { type: 'heading', text: 'The landscape today' },
      {
        type: 'list',
        items: [
          'Ollama — the friendliest on-ramp. One install, then "ollama run" and you are chatting with a model.',
          'LM Studio — a polished desktop app with a model browser and a built-in chat window. Great if you prefer buttons over a terminal.',
          'llama.cpp — the lean, fast engine that powers much of the ecosystem. Maximum control, minimum hand-holding.',
          'vLLM & SGLang — GPU-powered serving engines for high-throughput, OpenAI-compatible APIs.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'They all run the same kind of open models (Llama, Mistral, Qwen, Gemma and friends). You can switch later — picking one now is not a life sentence.',
      },
    ],
    next: 'why-local',
    nextLabel: 'Begin the journey',
  },

  'why-local': {
    id: 'why-local',
    title: 'Why local, not the cloud?',
    body: [
      {
        type: 'paragraph',
        text: 'Before the first real fork in the road, a question worth answering honestly: what is pulling you toward local AI? Your reason shapes which trade-offs are worth it.',
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'Pick the reason that resonates most. There are no wrong answers — this just tunes the advice ahead.',
      },
    ],
    choices: [
      {
        label: 'Privacy — my prompts and data stay on my machine',
        to: 'choose-level',
        sets: { reason: 'privacy' },
        hint: 'Nothing leaves your computer. Ideal for sensitive notes, code, or personal data.',
        info: {
          title: 'Privacy — why it matters',
          body: [
            {
              type: 'paragraph',
              text: 'With local AI, your prompts and the model\'s responses never leave your device. Nothing is logged on a third-party server, used to train someone else\'s model, or exposed in a provider data breach.',
            },
            {
              type: 'list',
              items: [
                'Great for: confidential code, legal or medical notes, personal journaling, and anything under NDA or compliance rules (GDPR/HIPAA).',
                'No telemetry by default: the open tools here run fully offline; you control what (if anything) is shared.',
                'Trade-off: you give up the very largest frontier models, but open models (Llama, Qwen, Mistral, Gemma) are more than capable for most everyday tasks.',
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              text: 'For true isolation you can run on a machine with no network access at all — the model still works.',
            },
          ],
        },
      },
      {
        label: 'Cost — no per-token bills or monthly subscriptions',
        to: 'choose-level',
        sets: { reason: 'cost' },
        hint: 'Pay once (in hardware) and run as much as you like.',
        info: {
          title: 'Cost — what to expect',
          body: [
            {
              type: 'paragraph',
              text: 'Local AI swaps a recurring API/subscription bill for a one-time hardware cost plus electricity. Once it runs, you can generate unlimited tokens, batch-process huge jobs, and experiment freely without watching a meter.',
            },
            {
              type: 'list',
              items: [
                'No per-token fees: ideal for high-volume, repetitive, or agentic workloads that would rack up cloud costs.',
                'Runs on what you have: a recent laptop handles small models with zero extra spend; a GPU only matters if you want more speed or bigger models.',
                'Trade-off: top-end GPUs are expensive, and you maintain your own setup — but there is no monthly bill.',
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              text: 'You can start free today on your current machine and only invest in hardware once you know local AI is for you.',
            },
          ],
        },
      },
      {
        label: 'Offline — I want it to work without internet',
        to: 'choose-level',
        sets: { reason: 'offline' },
        hint: 'Planes, trains, cabins, and locked-down networks.',
        info: {
          title: 'Offline — working without a connection',
          body: [
            {
              type: 'paragraph',
              text: 'Once a model is downloaded, local AI runs entirely on your machine with no internet required. There is no API outage, rate limit, or "service unavailable" — it works on a plane, in a cabin, or on a locked-down corporate network.',
            },
            {
              type: 'list',
              items: [
                'Download once, run anywhere: you only need a connection to fetch the model and tool the first time.',
                'No dependence on a provider: no surprise deprecations, throttling, or pricing changes mid-project.',
                'Reliable latency: responses come from local hardware, so speed is consistent and predictable.',
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              text: 'Pull the models you expect to need before you go offline — that is the only step that needs the internet.',
            },
          ],
        },
      },
      {
        label: 'Control & tinkering — I want to swap models and poke under the hood',
        to: 'choose-level',
        sets: { reason: 'control' },
        hint: 'Full control over models, parameters, and prompts.',
        info: {
          title: 'Control & tinkering — the power-user path',
          body: [
            {
              type: 'paragraph',
              text: 'Running locally hands you the full stack: choose any open model, set sampling parameters, edit the system prompt, swap quantizations, and wire the model into your own scripts and apps through a local API.',
            },
            {
              type: 'list',
              items: [
                'Swap freely: try Llama, Qwen, Mistral, Gemma, DeepSeek and more, at different sizes and quantization levels.',
                'Tune everything: temperature, context length, and prompt format are all yours to adjust — no hidden server-side defaults.',
                'Build on it: OpenAI-compatible local endpoints let your existing code talk to your own model by changing only the base URL.',
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              text: 'If you enjoy poking under the hood, the Advanced track and llama.cpp give you the deepest level of control.',
            },
          ],
        },
      },
    ],
  },

  'choose-level': {
    id: 'choose-level',
    title: 'How deep do you want to go?',
    body: [
      {
        type: 'paragraph',
        text: 'The first real question. How much technical detail do you want? You can always come back and switch tracks.',
      },
    ],
    choices: [
      {
        label: 'Beginner — just get me chatting with a model',
        to: 'choose-os',
        // Switching level invalidates any downstream selections.
        sets: { level: 'beginner', os: undefined, hardware: undefined, tool: undefined },
        hint: 'Clear, copy-paste steps. We skip the deep theory.',
        info: {
          title: 'Beginner track — what you get',
          body: [
            {
              type: 'paragraph',
              text: 'The Beginner track gets you chatting with a model as fast as possible. It favours friendly tools with installers (Ollama, LM Studio), copy-paste commands, and sensible defaults — no theory you do not need yet.',
            },
            {
              type: 'list',
              items: [
                'Focus: install a tool, download a model, start a conversation.',
                'Minimal jargon: we explain the few terms that matter and skip the rest.',
                'Safe to pick: you can switch to the Advanced track at any time without starting over.',
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              text: 'Most people should start here. You can always go deeper once the basics click.',
            },
          ],
        },
      },
      {
        label: 'Advanced — I want the details and the power tools',
        to: 'choose-os',
        sets: { level: 'advanced', os: undefined, hardware: undefined, tool: undefined },
        hint: 'APIs, servers, quantization, and configuration along the way.',
        info: {
          title: 'Advanced track — what you get',
          body: [
            {
              type: 'paragraph',
              text: 'The Advanced track adds the details and the power tools: running a local API server, tuning performance and quantization, and engines built for throughput like vLLM and SGLang alongside llama.cpp.',
            },
            {
              type: 'list',
              items: [
                'Focus: serving models over an API, configuration, quantization, and getting the most from your hardware.',
                'More options: surfaces server-grade tools that the Beginner track keeps out of the way.',
                'Assumes comfort with a terminal and editing config — but still step-by-step.',
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              text: 'Pick this if you plan to build on top of a model (apps, agents, automation) rather than just chat.',
            },
          ],
        },
      },
    ],
  },
};
