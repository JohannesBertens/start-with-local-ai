import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';
import { imageGpuNote } from './shared';

export const fooocus: ToolDef = {
  id: 'fooocus',
  label: 'Fooocus',
  useCases: ['image-video'],
  summary: 'Simplest, Midjourney-style image generation with great defaults.',
  info: [
    {
      type: 'paragraph',
      text: 'Fooocus is a free, open-source (GPL-3.0) image generator that strips away the complexity: type a prompt and get a good SDXL image, with quality-boosting tricks applied automatically behind the scenes. It is the most beginner-friendly local option — think a local, offline Midjourney.',
    },
    {
      type: 'list',
      items: [
        'Best for: getting great images fast with almost no settings to learn.',
        'Automatic quality: built-in prompt expansion, refiners, and sensible defaults do the tuning for you.',
        'Low fuss: downloads the models it needs on first launch; no manual checkpoint hunting to get started.',
        'Platforms: Windows (one-click package), plus macOS and Linux via a short install. Best with an NVIDIA GPU (8 GB+ VRAM).',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      text: 'Fooocus trades fine-grained control for simplicity — once you want nodes, ControlNet pipelines, or video, graduate to ComfyUI.',
    },
  ],
  supports: (ctx) => ctx.os === 'windows' || ctx.os === 'macos' || ctx.os === 'linux',
  install: (ctx) => {
    switch (ctx.os) {
      case 'macos':
        return {
          title: 'Install Fooocus on macOS',
          body: [
            {
              type: 'paragraph',
              text: 'On Apple Silicon, clone the repo and install into a Conda or venv environment:',
            },
            {
              type: 'code',
              lang: 'bash',
              code: 'git clone https://github.com/lllyasviel/Fooocus\ncd Fooocus\npython3 -m venv fooocus_env && source fooocus_env/bin/activate\npip install -r requirements_versions.txt\npython entry_with_update.py',
            },
            {
              type: 'callout',
              tone: 'info',
              text: 'macOS support is experimental and uses Metal (MPS); generation is slower than on NVIDIA. The first run downloads the default SDXL models.',
            },
          ],
        };
      case 'windows':
        return {
          title: 'Install Fooocus on Windows',
          body: [
            {
              type: 'paragraph',
              text: 'Windows has the easiest path — a self-contained package, no Python required:',
            },
            {
              type: 'list',
              ordered: true,
              items: [
                'Download the Fooocus package from the GitHub releases (a 7z archive) at https://github.com/lllyasviel/Fooocus.',
                'Extract it with 7-Zip to a folder with plenty of free disk space.',
                'Double-click run.bat — it downloads the default models on first launch and opens your browser automatically.',
              ],
            },
            imageGpuNote(ctx.hardware),
          ],
        };
      case 'linux':
      default:
        return {
          title: 'Install Fooocus on Linux',
          body: [
            {
              type: 'paragraph',
              text: 'Clone the repo and run it inside a virtual environment:',
            },
            {
              type: 'code',
              lang: 'bash',
              code: 'git clone https://github.com/lllyasviel/Fooocus\ncd Fooocus\npython3 -m venv fooocus_env && source fooocus_env/bin/activate\npip install -r requirements_versions.txt\npython entry_with_update.py',
            },
            imageGpuNote(ctx.hardware),
          ],
        };
    }
  },
  steps: [
    {
      slug: 'generate',
      title: 'Generate your first image',
      body: [
        {
          type: 'paragraph',
          text: 'Fooocus opens a simple web page (http://127.0.0.1:7865) with a single prompt box:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Wait for the first launch to finish downloading its default SDXL models.',
            'Type what you want to see in the prompt box.',
            'Press Generate — Fooocus expands your prompt and produces a polished image in a few seconds (on a capable GPU).',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Tick "Advanced" to reveal aspect ratio, image count, and style presets — but the defaults already produce great results.',
        },
      ],
      choices: [
        { label: 'Show me the handful of options worth knowing', to: 'advanced' },
        { label: "I've made an image — wrap up", to: 'done' },
      ],
    },
    {
      slug: 'advanced',
      title: 'A few options worth knowing',
      body: [
        {
          type: 'list',
          items: [
            'Styles: pick from preset styles (cinematic, anime, photographic, …) to steer the look without prompt engineering.',
            'Performance: "Speed" vs "Quality" vs "Extreme Speed" trades generation time for detail.',
            'Input Image: enable it for img2img, inpainting, and image prompts (use a reference image to guide the result).',
            'Aspect ratios: choose from common sizes instead of typing width/height.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'That is most of Fooocus — its whole point is that you rarely need more than the prompt box.',
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
          text: 'You have a no-fuss local image generator running on your own GPU. From here you might:',
        },
        {
          type: 'list',
          items: [
            'Explore the built-in styles to quickly change the mood of an image.',
            'Use an input image for img2img and inpainting.',
            'Move to ComfyUI or SD WebUI when you want ControlNet, LoRAs, or video.',
          ],
        },
      ],
      terminal: true,
      choices: [{ label: 'Explore another tool or path', to: EXPLORE_TARGET }],
    },
  ],
};
