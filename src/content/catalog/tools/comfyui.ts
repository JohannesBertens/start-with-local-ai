import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';
import { imageGpuNote } from './shared';

export const comfyui: ToolDef = {
  id: 'comfyui',
  label: 'ComfyUI',
  useCases: ['image-video'],
  summary: 'Node-based powerhouse — best for video and the newest models.',
  info: [
    {
      type: 'paragraph',
      text: 'ComfyUI is a free, open-source (GPL-3.0) node-based interface for Stable Diffusion, SDXL, SD3.5, FLUX, and modern video models. You wire a graph of nodes (load model → prompt → sample → save) into a reusable workflow, which gives precise control and excellent VRAM efficiency.',
    },
    {
      type: 'list',
      items: [
        'Best for: power users, complex pipelines, and the strongest local video generation (LTX, Wan, and image-to-video).',
        'Strengths: very memory-efficient, fastest to support new models, and workflows are shareable as JSON or embedded in a PNG.',
        'Learning curve: steeper than form-based UIs, but a desktop installer and a built-in model/workflow manager smooth the start.',
        'Platforms: a one-click desktop app for Windows and macOS, plus a portable build and manual install on Windows, macOS, and Linux.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'The community ships ready-made workflows — drag one onto the canvas and ComfyUI recreates the whole node graph for you.',
    },
  ],
  supports: (ctx) => ctx.os === 'windows' || ctx.os === 'macos' || ctx.os === 'linux',
  install: (ctx) => {
    switch (ctx.os) {
      case 'macos':
        return {
          title: 'Install ComfyUI on macOS',
          body: [
            {
              type: 'paragraph',
              text: 'On Apple Silicon the easiest route is the ComfyUI desktop app:',
            },
            {
              type: 'list',
              ordered: true,
              items: [
                'Download the macOS desktop app from https://www.comfy.org/download.',
                'Open it and drag ComfyUI to Applications, then launch it; it sets up its Python environment on first run.',
              ],
            },
            { type: 'heading', text: 'Or install manually' },
            {
              type: 'code',
              lang: 'bash',
              code: 'git clone https://github.com/comfyanonymous/ComfyUI\ncd ComfyUI\npython3 -m venv venv && source venv/bin/activate\npip install -r requirements.txt\npython main.py',
            },
            imageGpuNote(ctx.hardware),
          ],
        };
      case 'windows':
        return {
          title: 'Install ComfyUI on Windows',
          body: [
            {
              type: 'paragraph',
              text: 'Two easy options — the desktop app, or the portable build (no Python setup needed).',
            },
            {
              type: 'list',
              ordered: true,
              items: [
                'Desktop app: download the installer from https://www.comfy.org/download and run it.',
                'Or portable: download "ComfyUI_windows_portable" from the GitHub releases, unzip it, and run run_nvidia_gpu.bat (or run_cpu.bat).',
              ],
            },
            imageGpuNote(ctx.hardware),
            {
              type: 'callout',
              tone: 'tip',
              text: 'Install the ComfyUI-Manager custom node early — it makes installing models and other nodes a point-and-click affair.',
            },
          ],
        };
      case 'linux':
      default:
        return {
          title: 'Install ComfyUI on Linux',
          body: [
            {
              type: 'paragraph',
              text: 'Clone the repo into a virtual environment and install PyTorch for your GPU:',
            },
            {
              type: 'code',
              lang: 'bash',
              code: 'git clone https://github.com/comfyanonymous/ComfyUI\ncd ComfyUI\npython3 -m venv venv && source venv/bin/activate\n' +
                (ctx.hardware === 'amd-gpu'
                  ? 'pip install torch --index-url https://download.pytorch.org/whl/rocm6.2\n'
                  : 'pip install torch --index-url https://download.pytorch.org/whl/cu124\n') +
                'pip install -r requirements.txt\npython main.py',
            },
            imageGpuNote(ctx.hardware),
          ],
        };
    }
  },
  steps: [
    {
      slug: 'getmodel',
      title: 'Get a checkpoint and start',
      body: [
        {
          type: 'paragraph',
          text: 'ComfyUI needs a model "checkpoint" to generate. Download one and drop it into the models folder:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'From Hugging Face or Civitai, download a checkpoint such as an SDXL or FLUX model (a .safetensors file).',
            'Place it in ComfyUI/models/checkpoints/.',
            'Start ComfyUI and open http://127.0.0.1:8188 in your browser.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'ComfyUI-Manager (Manager button) can download popular models and missing nodes for you — the easiest way to fetch checkpoints.',
        },
      ],
      nextSlug: 'generate',
    },
    {
      slug: 'generate',
      title: 'Generate your first image',
      body: [
        {
          type: 'paragraph',
          text: 'ComfyUI loads a default text-to-image workflow on first launch:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'In the "Load Checkpoint" node, select the model you downloaded.',
            'Type a prompt in the positive "CLIP Text Encode" box (and things to avoid in the negative one).',
            'Click Queue Prompt — the image appears in the Save Image node when sampling finishes.',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Lower the resolution or sampling steps if you run out of VRAM or generation is slow, then raise them once it works.',
        },
      ],
      choices: [
        { label: 'Tell me about video & advanced workflows', to: 'advanced' },
        { label: "I've made an image — wrap up", to: 'done' },
      ],
    },
    {
      slug: 'advanced',
      title: 'Advanced: custom nodes, video & ControlNet',
      body: [
        {
          type: 'list',
          items: [
            'ComfyUI-Manager: install custom nodes and models from inside the UI — the gateway to most extensions.',
            'Video: load a video workflow (e.g. LTX-Video, Wan, or Stable Video Diffusion) to do text-to-video or animate a still image.',
            'ControlNet & LoRA: add nodes to guide composition (pose, depth, edges) or apply fine-tuned styles.',
            'Save & share: export a workflow as JSON, or drag a generated PNG back in to restore the exact graph that made it.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'Video pipelines are the most VRAM-hungry workloads here — start with short clips and modest resolutions.',
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
          text: 'You now have a private image (and video) studio running on your own GPU. From here you might:',
        },
        {
          type: 'list',
          items: [
            'Collect a few favourite community workflows and adapt them to your style.',
            'Add ControlNet and LoRA nodes for precise, repeatable results.',
            'Experiment with a local video model for short animated clips.',
          ],
        },
      ],
      terminal: true,
      choices: [{ label: 'Explore another tool or path', to: EXPLORE_TARGET }],
    },
  ],
};
