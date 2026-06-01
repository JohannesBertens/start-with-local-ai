import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';
import { imageGpuNote } from './shared';

export const invokeai: ToolDef = {
  id: 'invokeai',
  label: 'InvokeAI',
  useCases: ['image-video'],
  summary: 'Canvas-based studio with strong inpainting & editing.',
  info: [
    {
      type: 'paragraph',
      text: 'InvokeAI is an open-source (Apache 2.0) image-generation studio built around a Unified Canvas for iterative editing — inpainting, outpainting, and compositing — alongside a node workflow editor. It sits between the simplicity of Fooocus and the full node power of ComfyUI.',
    },
    {
      type: 'list',
      items: [
        'Best for: artists and editors who want Photoshop-style canvas workflows and precise inpainting/outpainting.',
        'Models: SD 1.5, SDXL, and FLUX, with a built-in model manager and a board system to organise outputs.',
        'Install: a graphical "Invoke Community Edition" launcher handles the Python setup for you.',
        'Platforms: Windows, macOS, and Linux. An NVIDIA GPU is recommended; AMD (ROCm on Linux) and Apple Silicon work too.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'The Unified Canvas is the standout feature — paint a rough layout or mask a region and let the model fill it in seamlessly.',
    },
  ],
  supports: (ctx) => ctx.os === 'windows' || ctx.os === 'macos' || ctx.os === 'linux',
  install: (ctx) => {
    const launcher = {
      type: 'list' as const,
      ordered: true,
      items: [
        'Open https://www.invoke.com/downloads and download the Invoke Community Edition launcher for your OS.',
        'Run the launcher; it installs InvokeAI into its own environment and lets you pick a folder for models and outputs.',
        'Click Launch — Invoke starts a local server and opens the studio in your browser at http://127.0.0.1:9090.',
      ],
    };
    switch (ctx.os) {
      case 'macos':
        return {
          title: 'Install InvokeAI on macOS',
          body: [
            launcher,
            {
              type: 'callout',
              tone: 'info',
              text: 'On Apple Silicon Invoke uses Metal (MPS). The launcher manages Python for you, so there is nothing to compile.',
            },
          ],
        };
      case 'windows':
        return {
          title: 'Install InvokeAI on Windows',
          body: [
            launcher,
            imageGpuNote(ctx.hardware),
          ],
        };
      case 'linux':
      default:
        return {
          title: 'Install InvokeAI on Linux',
          body: [
            {
              type: 'paragraph',
              text: 'Use the graphical launcher, or install the Python package directly:',
            },
            launcher,
            { type: 'heading', text: 'Or install via pip' },
            {
              type: 'code',
              lang: 'bash',
              code: 'python3 -m venv invokeai && source invokeai/bin/activate\npip install InvokeAI' +
                (ctx.hardware === 'amd-gpu'
                  ? ' --extra-index-url https://download.pytorch.org/whl/rocm6.2'
                  : '') +
                '\ninvokeai-web',
            },
            imageGpuNote(ctx.hardware),
          ],
        };
    }
  },
  steps: [
    {
      slug: 'getmodel',
      title: 'Install a model',
      body: [
        {
          type: 'paragraph',
          text: 'Invoke has a built-in model manager, so you rarely touch files by hand:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Open the Model Manager tab in the studio.',
            'Use Starter Models to install a recommended SDXL (or FLUX) model with one click, or paste a Hugging Face / Civitai link.',
            'Wait for the download to finish — the model then appears in the generation panel.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'Boards keep your generations organised — a handy way to separate projects and references.',
        },
      ],
      nextSlug: 'generate',
    },
    {
      slug: 'generate',
      title: 'Generate and edit on the canvas',
      body: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Select your model, type a prompt, and click Invoke to generate an image.',
            'Send a result to the Canvas to refine it.',
            'On the Canvas, mask an area and regenerate just that region (inpainting), or extend beyond the edges (outpainting).',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Iterate: generate a base image, then fix hands, swap a background, or extend the scene right on the canvas instead of starting over.',
        },
      ],
      choices: [
        { label: 'Tell me about ControlNet & workflows', to: 'advanced' },
        { label: "I've made an image — wrap up", to: 'done' },
      ],
    },
    {
      slug: 'advanced',
      title: 'Advanced: control layers & workflows',
      body: [
        {
          type: 'list',
          items: [
            'Control layers: add ControlNet guidance (pose, depth, edges) and regional prompts directly on the canvas.',
            'LoRAs: install LoRA models via the manager and stack them for custom styles or characters.',
            'Workflow editor: switch to the node editor for repeatable, branching pipelines when you outgrow the canvas.',
            'Boards & galleries: organise, tag, and revisit every generation with its full settings.',
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
          text: 'You have a canvas-based image studio running privately on your own hardware. From here you might:',
        },
        {
          type: 'list',
          items: [
            'Master inpainting/outpainting on the Unified Canvas for precise edits.',
            'Add ControlNet layers to lock in composition and pose.',
            'Try the workflow editor when you need repeatable, multi-step pipelines.',
          ],
        },
      ],
      terminal: true,
      choices: [{ label: 'Explore another tool or path', to: EXPLORE_TARGET }],
    },
  ],
};
