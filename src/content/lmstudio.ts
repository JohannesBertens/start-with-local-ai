import type { Story } from './types';

export const lmStudioNodes: Story = {
  'lmstudio-win-install': {
    id: 'lmstudio-win-install',
    title: 'Install LM Studio on Windows',
    body: [
      {
        type: 'list',
        ordered: true,
        items: [
          'Go to https://lmstudio.ai and download the Windows installer.',
          'Run the installer (it installs per-user, no admin rights required) and launch LM Studio.',
          'On first launch you land on the Discover/Home screen — that is where you will find and download models.',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'LM Studio needs a 64-bit machine. A discrete GPU helps a lot but is not required — it will fall back to CPU.',
      },
    ],
    next: 'lmstudio-firstrun',
  },

  'lmstudio-mac-install': {
    id: 'lmstudio-mac-install',
    title: 'Install LM Studio on macOS',
    body: [
      {
        type: 'list',
        ordered: true,
        items: [
          'Download the macOS build (Apple Silicon) from https://lmstudio.ai.',
          'Open the .dmg and drag LM Studio into Applications.',
          'Launch it from Applications. If macOS warns about an unidentified developer, right-click the app and choose Open the first time.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'On M-series Macs, LM Studio uses Apple\'s MLX and Metal under the hood for fast, energy-efficient inference.',
      },
    ],
    next: 'lmstudio-firstrun',
  },

  'lmstudio-linux-install': {
    id: 'lmstudio-linux-install',
    title: 'Install LM Studio on Linux',
    body: [
      {
        type: 'list',
        ordered: true,
        items: [
          'Download the Linux AppImage from https://lmstudio.ai.',
          'Make it executable, then run it.',
        ],
      },
      {
        type: 'code',
        lang: 'bash',
        code: 'chmod +x LM-Studio-*.AppImage\n./LM-Studio-*.AppImage',
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'If the AppImage will not start, install FUSE (e.g. "sudo apt install libfuse2" on Debian/Ubuntu) or run it with the --appimage-extract-and-run flag.',
      },
    ],
    next: 'lmstudio-firstrun',
  },

  'lmstudio-firstrun': {
    id: 'lmstudio-firstrun',
    title: 'Download a model and chat',
    body: [
      {
        type: 'list',
        ordered: true,
        items: [
          'Click the Discover (magnifying glass) tab and search for a model — "Llama 3.2 3B" or "Qwen2.5 7B" are great starters.',
          'Pick a quantization. LM Studio shows a green check next to options that fit comfortably in your memory; a 4-bit (Q4) build is the usual sweet spot.',
          'Click Download and wait for it to finish.',
          'Switch to the Chat (speech bubble) tab, select your model at the top, and start typing.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'See a model you like but it shows a red "likely too large" warning? Choose a smaller parameter count or a more aggressive quantization (Q4 instead of Q8).',
      },
    ],
    next: 'lmstudio-usage',
  },

  'lmstudio-usage': {
    id: 'lmstudio-usage',
    title: 'Getting comfortable in LM Studio',
    body: [
      {
        type: 'paragraph',
        text: 'A tour of the things worth knowing in the app:',
      },
      {
        type: 'list',
        items: [
          'My Models tab — manage what you have downloaded and free up disk space.',
          'System prompt — set the assistant\'s persona/instructions in the chat sidebar.',
          'Per-chat settings — temperature, context length, and GPU offload live in the right-hand panel.',
          'Presets — save a system prompt + parameters combo to reuse later.',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'The "GPU offload" slider controls how many layers run on the GPU. Push it as high as your VRAM allows for speed; lower it if you hit out-of-memory errors.',
      },
    ],
    choices: [
      {
        label: 'Go deeper — run LM Studio as a local server',
        to: 'lmstudio-advanced',
        hint: 'An OpenAI-compatible endpoint your own apps can call.',
      },
      {
        label: "I'm happy chatting — wrap up",
        to: 'lmstudio-done',
      },
    ],
  },

  'lmstudio-advanced': {
    id: 'lmstudio-advanced',
    title: 'Advanced: the LM Studio local server',
    body: [
      {
        type: 'paragraph',
        text: 'LM Studio can expose your loaded model over an OpenAI-compatible HTTP API — perfect for plugging local AI into your own scripts and apps.',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Open the Developer (or "Local Server") tab.',
          'Select a model to load and click Start Server. By default it listens on http://localhost:1234.',
          'Point any OpenAI-compatible client at that address.',
        ],
      },
      { type: 'heading', text: 'Example request' },
      {
        type: 'code',
        lang: 'bash',
        code: 'curl http://localhost:1234/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "model": "local-model",\n    "messages": [{"role": "user", "content": "Hello from my own server!"}]\n  }\'',
      },
      {
        type: 'paragraph',
        text: 'Most OpenAI SDKs work by setting base_url to http://localhost:1234/v1 and using any placeholder API key.',
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'LM Studio also ships a CLI called "lms". Run "lms server start" to launch the server without opening the GUI.',
      },
    ],
    next: 'lmstudio-done',
  },

  'lmstudio-done': {
    id: 'lmstudio-done',
    title: 'You are running local AI 🎉',
    body: [
      {
        type: 'paragraph',
        text: 'You now have a graphical, fully local AI workbench. Good next moves:',
      },
      {
        type: 'list',
        items: [
          'Collect a couple of models for different jobs — a small fast one and a larger smarter one.',
          'Save a preset with your favourite system prompt and settings.',
          'Try the local server to connect LM Studio to your own tools.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'Want the command-line or bare-metal experience next? Explore another path below — your progress stays saved.',
      },
    ],
    terminal: true,
    choices: [
      {
        label: 'Explore another tool or operating system',
        to: 'choose-os',
      },
    ],
  },
};
