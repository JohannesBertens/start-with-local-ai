import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';

export const gpt4all: ToolDef = {
  id: 'gpt4all',
  label: 'GPT4All',
  useCases: ['chat'],
  summary: 'The most frictionless install-and-go chat app.',
  info: [
    {
      type: 'paragraph',
      text: 'GPT4All (by Nomic) is a free, open-source desktop app built to be the simplest possible on-ramp: install it, pick a model from a built-in list, and start chatting — no terminal, no configuration. It runs fully offline on ordinary CPUs.',
    },
    {
      type: 'list',
      items: [
        'Best for: absolute beginners and modest hardware that just want a chat window that works.',
        'LocalDocs: a built-in feature that lets the model answer questions about your own files (a simple, private RAG) without sending them anywhere.',
        'Engine: a llama.cpp-based backend running GGUF models; CPU-friendly, with optional GPU acceleration.',
        'Platforms: native installers for Windows, macOS, and Linux. It is a desktop GUI, not a headless server.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      text: 'It favours approachability over raw speed — great for getting started, then graduate to Ollama or llama.cpp when you want more control.',
    },
  ],
  supports: (ctx) => ctx.os === 'windows' || ctx.os === 'macos' || ctx.os === 'linux',
  install: (ctx) => {
    switch (ctx.os) {
      case 'macos':
        return {
          title: 'Install GPT4All on macOS',
          body: [
            {
              type: 'list',
              ordered: true,
              items: [
                'Open https://gpt4all.io and download the macOS installer (.dmg).',
                'Open the .dmg and drag GPT4All into Applications, then launch it.',
                'Approve the app in System Settings → Privacy & Security if macOS warns about an internet download.',
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              text: 'Apple Silicon is supported and uses Metal where available; an Intel Mac runs on CPU.',
            },
          ],
        };
      case 'windows':
        return {
          title: 'Install GPT4All on Windows',
          body: [
            {
              type: 'list',
              ordered: true,
              items: [
                'Open https://gpt4all.io and download the Windows installer (.exe).',
                'Run it and accept the defaults; GPT4All installs like any normal app.',
                'Launch GPT4All from the Start menu.',
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              text: 'No GPU is needed — GPT4All is designed to run comfortably on CPU. A supported GPU can be enabled later in Settings for extra speed.',
            },
          ],
        };
      case 'linux':
      default:
        return {
          title: 'Install GPT4All on Linux',
          body: [
            {
              type: 'paragraph',
              text: 'Download the Linux installer (.run) from https://gpt4all.io, then make it executable and run it:',
            },
            {
              type: 'code',
              lang: 'bash',
              code: 'chmod +x gpt4all-installer-linux.run\n./gpt4all-installer-linux.run',
            },
            {
              type: 'callout',
              tone: 'info',
              text: 'Follow the graphical installer prompts; it places GPT4All in your home directory by default.',
            },
          ],
        };
    }
  },
  steps: [
    {
      slug: 'firstrun',
      title: 'Pick a model and chat',
      body: [
        {
          type: 'paragraph',
          text: 'GPT4All opens to a model list. Starting a conversation is quick:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Open the Models tab and download one of the suggested small models (e.g. Llama 3.2 3B Instruct). The app shows its size so you can match it to your RAM.',
            'Go to the Chats tab and select the downloaded model.',
            'Type a message and press Enter — the reply is generated locally on your machine.',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'On limited RAM, pick the smallest model offered. You can always download a larger one later.',
        },
      ],
      nextSlug: 'usage',
    },
    {
      slug: 'usage',
      title: 'Chat with your own documents (LocalDocs)',
      body: [
        {
          type: 'paragraph',
          text: "GPT4All's standout feature is LocalDocs: let the model read a folder of your files and answer questions about them, all offline.",
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Open Settings → LocalDocs and add a collection pointing at a folder of documents (PDF, Markdown, txt, code).',
            'Wait for it to index the folder.',
            'In a chat, enable that collection — the model now cites and answers from your files.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'Nothing is uploaded: indexing and retrieval happen entirely on your computer.',
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
          text: 'You have a private assistant running on your own machine with zero configuration. From here you might:',
        },
        {
          type: 'list',
          items: [
            'Point LocalDocs at your notes or a codebase to chat with your own information.',
            'Try a slightly larger model once you know your machine can handle it.',
            'Move to Ollama or llama.cpp when you want an API, scripting, or more speed.',
          ],
        },
      ],
      terminal: true,
      choices: [{ label: 'Explore another tool or path', to: EXPLORE_TARGET }],
    },
  ],
};
