import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';
import { imageGpuNote } from './shared';

export const sdnext: ToolDef = {
  id: 'sdnext',
  label: 'SD.Next',
  useCases: ['image-video'],
  summary: 'All-in-one WebUI supporting the widest range of models & backends.',
  info: [
    {
      type: 'paragraph',
      text: 'SD.Next (vladmandic) is an open-source all-in-one image-and-video generation WebUI. Originally a fork in the A1111 family, it now supports an exceptionally wide range of model families (SD 1.5/2.x, SDXL, SD3.x, FLUX, and many video models) and hardware backends in one polished interface.',
    },
    {
      type: 'list',
      items: [
        'Best for: enthusiasts who want one UI that keeps up with the newest models and many different GPUs.',
        'Broad backends: NVIDIA CUDA, AMD ROCm/ZLUDA, Intel Arc (IPEX), and Apple Silicon — wider than most rivals.',
        'Modern UI: a refreshed interface with built-in model management, plus a compatibility mode for A1111 extensions.',
        'Platforms: Windows, macOS, and Linux via its launch scripts.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      text: 'If your GPU is unusual (Intel Arc, older AMD, etc.), SD.Next often has the smoothest backend story of the WebUIs.',
    },
  ],
  supports: (ctx) => ctx.os === 'windows' || ctx.os === 'macos' || ctx.os === 'linux',
  install: (ctx) => {
    const clone = {
      type: 'code' as const,
      lang: 'bash',
      code: 'git clone https://github.com/vladmandic/sdnext\ncd sdnext',
    };
    switch (ctx.os) {
      case 'macos':
        return {
          title: 'Install SD.Next on macOS',
          body: [
            {
              type: 'paragraph',
              text: 'Make sure Python 3.10+ and git are installed (e.g. via Homebrew), then clone and run the launcher:',
            },
            clone,
            { type: 'code', lang: 'bash', code: './webui.sh' },
            {
              type: 'callout',
              tone: 'info',
              text: 'The launcher builds its own environment and auto-detects Apple Silicon (MPS). The first run installs dependencies and can take a while.',
            },
          ],
        };
      case 'windows':
        return {
          title: 'Install SD.Next on Windows',
          body: [
            {
              type: 'list',
              ordered: true,
              items: [
                'Install Python 3.10/3.11 (tick "Add to PATH") and Git for Windows.',
                'Clone the repo: git clone https://github.com/vladmandic/sdnext',
                'Run webui.bat in the folder — it sets up the environment and picks a backend for your GPU.',
              ],
            },
            imageGpuNote(ctx.hardware),
            {
              type: 'callout',
              tone: 'tip',
              text: 'On AMD, SD.Next can use ZLUDA on Windows; on Intel Arc it uses IPEX — both are selectable during setup.',
            },
          ],
        };
      case 'linux':
      default:
        return {
          title: 'Install SD.Next on Linux',
          body: [
            {
              type: 'paragraph',
              text: 'Install Python 3.10+ and git, then clone and launch — the script creates a virtual environment automatically:',
            },
            clone,
            {
              type: 'code',
              lang: 'bash',
              code: './webui.sh' + (ctx.hardware === 'amd-gpu' ? '  # ROCm auto-detected on supported AMD GPUs' : ''),
            },
            imageGpuNote(ctx.hardware),
          ],
        };
    }
  },
  steps: [
    {
      slug: 'getmodel',
      title: 'Choose a backend and model',
      body: [
        {
          type: 'paragraph',
          text: 'SD.Next opens at http://127.0.0.1:7860. On first use it helps you pick the right setup:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Confirm the detected compute backend (CUDA / ROCm / IPEX / MPS) in Settings if prompted.',
            'Use the built-in Model Manager to download a checkpoint (SDXL or FLUX are good starts), or drop a .safetensors into models/Stable-diffusion.',
            'Select the model from the dropdown at the top of the UI.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'SD.Next can fetch models from Hugging Face and Civitai directly through its manager — no manual file wrangling needed.',
        },
      ],
      nextSlug: 'generate',
    },
    {
      slug: 'generate',
      title: 'Generate an image',
      body: [
        {
          type: 'list',
          ordered: true,
          items: [
            'On the Text tab, enter a prompt (and a negative prompt).',
            'Match the resolution to your model (1024×1024 for SDXL) and keep steps modest to start.',
            'Click Generate — outputs are shown and saved to the outputs folder.',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'If VRAM is tight, enable model offload / low-VRAM options in Settings rather than dropping quality.',
        },
      ],
      choices: [
        { label: 'Tell me about its broader features', to: 'advanced' },
        { label: "I've made an image — wrap up", to: 'done' },
      ],
    },
    {
      slug: 'advanced',
      title: 'Advanced: video, control & compatibility',
      body: [
        {
          type: 'list',
          items: [
            'Many model families: switch between SD, SDXL, SD3.x, FLUX, and supported video models from one UI.',
            'ControlNet & IP-Adapter: guide composition and transfer styles/identity.',
            'Video: generate short clips with supported text-to-video / image-to-video pipelines.',
            'A1111 compatibility: reuse many AUTOMATIC1111 extensions and model folders.',
          ],
        },
      ],
      nextSlug: 'done',
    },
    {
      slug: 'done',
      title: 'You are generating locally 🎉',
      body: [
        {
          type: 'paragraph',
          text: 'You have a flexible, backend-agnostic image (and video) studio running on your own hardware. From here you might:',
        },
        {
          type: 'list',
          items: [
            'Experiment across model families without switching tools.',
            'Lean on the broad backend support if you have an Intel or AMD GPU.',
            'Add ControlNet and try a short local video generation.',
          ],
        },
      ],
      terminal: true,
      choices: [{ label: 'Explore another tool or path', to: EXPLORE_TARGET }],
    },
  ],
};
