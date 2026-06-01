import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';

export const jan: ToolDef = {
  id: 'jan',
  label: 'Jan',
  useCases: ['chat'],
  summary: 'Open-source desktop chat app (an OSS LM Studio).',
  info: [
    {
      type: 'paragraph',
      text: 'Jan is a free, open-source (Apache 2.0) desktop app for chatting with local models — think of it as a fully open-source alternative to LM Studio. It has a model hub for one-click downloads, a clean chat window, and a built-in OpenAI-compatible API server, all running offline by default.',
    },
    {
      type: 'list',
      items: [
        'Best for: people who want a polished graphical chat app but prefer open-source over proprietary.',
        'Engine: runs GGUF models through a bundled llama.cpp engine (Metal on Apple Silicon, CUDA/Vulkan on PC); can also connect to remote APIs.',
        'Server: a local OpenAI-compatible server (default port 1337) so your own apps can talk to it.',
        'Platforms: native installers for Windows, macOS, and Linux — it is a desktop GUI, not a headless Docker server.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'Privacy-first: Jan stores everything locally in open file formats, so your chats and models stay on your disk and are easy to back up.',
    },
  ],
  supports: (ctx) => ctx.os === 'windows' || ctx.os === 'macos' || ctx.os === 'linux',
  install: (ctx) => {
    switch (ctx.os) {
      case 'macos':
        return {
          title: 'Install Jan on macOS',
          body: [
            {
              type: 'list',
              ordered: true,
              items: [
                'Open https://jan.ai and download the macOS app (a universal .dmg for Apple Silicon and Intel).',
                'Open the .dmg and drag Jan into your Applications folder, then launch it.',
                'On first launch, macOS may ask you to confirm opening an app downloaded from the internet — approve it in System Settings → Privacy & Security if needed.',
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              text: 'On Apple Silicon Jan uses the Metal backend automatically — no drivers to install.',
            },
          ],
        };
      case 'windows':
        return {
          title: 'Install Jan on Windows',
          body: [
            {
              type: 'list',
              ordered: true,
              items: [
                'Open https://jan.ai and download the Windows installer (jan-win-x64-*.exe).',
                'Run the installer and accept the defaults; Jan adds a Start-menu entry.',
                'Launch Jan — on an NVIDIA GPU it offers a CUDA backend; otherwise it falls back to Vulkan or CPU.',
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              text: 'Install a recent GPU driver before first run so Jan can detect and use your GPU for faster responses.',
            },
          ],
        };
      case 'linux':
      default:
        return {
          title: 'Install Jan on Linux',
          body: [
            {
              type: 'paragraph',
              text: 'Jan ships an AppImage and .deb/.rpm packages. The AppImage runs anywhere — download it from https://jan.ai, then:',
            },
            {
              type: 'code',
              lang: 'bash',
              code: 'chmod +x Jan-*.AppImage\n./Jan-*.AppImage',
            },
            {
              type: 'callout',
              tone: 'info',
              text: 'On Debian/Ubuntu you can instead install the .deb (sudo apt install ./jan-linux-*.deb). NVIDIA users should have the proprietary driver installed for GPU acceleration.',
            },
          ],
        };
    }
  },
  steps: [
    {
      slug: 'firstrun',
      title: 'Download a model and chat',
      body: [
        {
          type: 'paragraph',
          text: 'Jan opens to a Hub of ready-to-run models. Getting chatting takes three clicks:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Open the Hub (the cube icon) and pick a small model to start — e.g. Llama 3.2 3B or Qwen2.5 3B. Jan shows whether it fits your RAM/VRAM.',
            'Click Download and wait for it to finish (a couple of gigabytes).',
            'Switch to the chat screen, select the downloaded model at the top, type a message, and press Enter.',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'If responses are slow or your machine struggles, choose a smaller model or a more compressed (lower-bit) quantization in the Hub.',
        },
      ],
      nextSlug: 'usage',
    },
    {
      slug: 'usage',
      title: 'Settings, presets & the local API',
      body: [
        {
          type: 'paragraph',
          text: 'Everything is in the UI: set a system prompt, temperature, and context length per conversation, and switch models without losing your chat history.',
        },
        {
          type: 'heading',
          text: 'Turn on the API server',
        },
        {
          type: 'paragraph',
          text: 'Jan can expose an OpenAI-compatible endpoint so your own scripts and apps can use the model. Enable it under Settings → Local API Server; it listens on:',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'base_url: http://localhost:1337/v1\napi_key:  any non-empty string',
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'Because it speaks the OpenAI API, existing OpenAI SDK code works by changing only the base URL.',
        },
      ],
      choices: [
        { label: "I'm chatting — wrap up", to: 'done' },
      ],
    },
    {
      slug: 'done',
      title: 'You are running local AI 🎉',
      body: [
        {
          type: 'paragraph',
          text: 'You now have a private, open-source chat app running models entirely on your machine. From here you might:',
        },
        {
          type: 'list',
          items: [
            'Try a few models from the Hub and keep the one that best fits your hardware.',
            'Enable the local API server and point your own tools at it.',
            'Compare with the command-line route (Ollama, llama.cpp) for scripting and automation.',
          ],
        },
      ],
      terminal: true,
      choices: [{ label: 'Explore another tool or path', to: EXPLORE_TARGET }],
    },
  ],
};
