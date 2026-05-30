import type { Story } from './types';

/** Intro + the gating questions that precede the tool tutorials. */
export const coreNodes: Story = {
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
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'All three run the same kind of open models (Llama, Mistral, Qwen, Gemma and friends). You can switch later — picking one now is not a life sentence.',
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
      },
      {
        label: 'Cost — no per-token bills or monthly subscriptions',
        to: 'choose-level',
        sets: { reason: 'cost' },
        hint: 'Pay once (in hardware) and run as much as you like.',
      },
      {
        label: 'Offline — I want it to work without internet',
        to: 'choose-level',
        sets: { reason: 'offline' },
        hint: 'Planes, trains, cabins, and locked-down networks.',
      },
      {
        label: 'Control & tinkering — I want to swap models and poke under the hood',
        to: 'choose-level',
        sets: { reason: 'control' },
        hint: 'Full control over models, parameters, and prompts.',
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
        sets: { level: 'beginner' },
        hint: 'Clear, copy-paste steps. We skip the deep theory.',
      },
      {
        label: 'Advanced — I want the details and the power tools',
        to: 'choose-os',
        sets: { level: 'advanced' },
        hint: 'APIs, servers, quantization, and configuration along the way.',
      },
    ],
  },

  'choose-os': {
    id: 'choose-os',
    title: 'Which machine are you on?',
    body: [
      {
        type: 'paragraph',
        text: 'Installation differs by operating system. Pick yours and we will route the rest of the adventure accordingly.',
      },
    ],
    choices: [
      {
        label: 'Windows',
        to: 'choose-tool-windows',
        sets: { os: 'windows' },
      },
      {
        label: 'macOS',
        to: 'choose-tool-macos',
        sets: { os: 'macos' },
        hint: 'Apple Silicon (M-series) is especially well suited to local AI.',
      },
      {
        label: 'Linux',
        to: 'choose-tool-linux',
        sets: { os: 'linux' },
      },
    ],
  },

  'choose-tool-windows': {
    id: 'choose-tool-windows',
    title: 'Pick your tool (Windows)',
    body: [
      {
        type: 'paragraph',
        text: 'Three solid choices. If you are unsure, Ollama is the smoothest start; LM Studio is best if you would rather click than type; llama.cpp is for those who want the raw engine.',
      },
    ],
    choices: [
      {
        label: 'Ollama — simplest command-line start',
        to: 'ollama-win-install',
        sets: { tool: 'ollama' },
      },
      {
        label: 'LM Studio — graphical desktop app',
        to: 'lmstudio-win-install',
        sets: { tool: 'lmstudio' },
      },
      {
        label: 'llama.cpp — the bare-metal engine',
        to: 'llamacpp-win-install',
        sets: { tool: 'llamacpp' },
        hint: 'More setup, most control.',
      },
    ],
  },

  'choose-tool-macos': {
    id: 'choose-tool-macos',
    title: 'Pick your tool (macOS)',
    body: [
      {
        type: 'paragraph',
        text: 'On Apple Silicon all three fly. Ollama is the smoothest start; LM Studio is the most point-and-click; llama.cpp gives you the raw engine and Metal acceleration.',
      },
    ],
    choices: [
      {
        label: 'Ollama — simplest command-line start',
        to: 'ollama-mac-install',
        sets: { tool: 'ollama' },
      },
      {
        label: 'LM Studio — graphical desktop app',
        to: 'lmstudio-mac-install',
        sets: { tool: 'lmstudio' },
      },
      {
        label: 'llama.cpp — the bare-metal engine',
        to: 'llamacpp-mac-install',
        sets: { tool: 'llamacpp' },
        hint: 'More setup, most control.',
      },
    ],
  },

  'choose-tool-linux': {
    id: 'choose-tool-linux',
    title: 'Pick your tool (Linux)',
    body: [
      {
        type: 'paragraph',
        text: 'Linux is home turf for all three. Ollama is the smoothest start; LM Studio offers an AppImage GUI; llama.cpp compiles lean and fast, with CUDA/ROCm if you have a GPU.',
      },
    ],
    choices: [
      {
        label: 'Ollama — simplest command-line start',
        to: 'ollama-linux-install',
        sets: { tool: 'ollama' },
      },
      {
        label: 'LM Studio — graphical desktop app',
        to: 'lmstudio-linux-install',
        sets: { tool: 'lmstudio' },
      },
      {
        label: 'llama.cpp — the bare-metal engine',
        to: 'llamacpp-linux-install',
        sets: { tool: 'llamacpp' },
        hint: 'Best raw performance if you are comfortable compiling.',
      },
    ],
  },
};
