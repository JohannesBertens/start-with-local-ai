import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';
import { imageGpuNote } from './shared';

export const a1111: ToolDef = {
  id: 'a1111',
  label: 'AUTOMATIC1111 (SD WebUI)',
  useCases: ['image-video'],
  summary: 'The classic form-based web UI with a huge extension ecosystem.',
  info: [
    {
      type: 'paragraph',
      text: 'AUTOMATIC1111 Stable Diffusion WebUI ("A1111") is the long-standing, form-based web interface for local image generation. It has the largest ecosystem of extensions, tutorials, and community knowledge, making it the most documented place to learn text-to-image.',
    },
    {
      type: 'list',
      items: [
        'Best for: people who want sliders and tabs (not nodes) plus a vast library of extensions — ControlNet, upscalers, LoRA, and scripts.',
        'Models: SD 1.5 and SDXL out of the box; for FLUX and SD3.5, the popular "Forge" fork (lllyasviel/stable-diffusion-webui-forge) is the recommended drop-in.',
        'Workflow: txt2img, img2img, inpainting, and batch generation in a familiar tabbed UI.',
        'Platforms: Windows, macOS, and Linux via its launch scripts (Python-based).',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'Want the newest models with the same UI? Install the Forge fork instead — it uses the same interface but is faster and supports FLUX/SD3.5.',
    },
  ],
  supports: (ctx) => ctx.os === 'windows' || ctx.os === 'macos' || ctx.os === 'linux',
  install: (ctx) => {
    switch (ctx.os) {
      case 'macos':
        return {
          title: 'Install SD WebUI on macOS',
          body: [
            {
              type: 'paragraph',
              text: 'On Apple Silicon, install the prerequisites with Homebrew, then clone and launch:',
            },
            {
              type: 'code',
              lang: 'bash',
              code: 'brew install cmake protobuf rust python@3.10 git wget\ngit clone https://github.com/AUTOMATIC1111/stable-diffusion-webui\ncd stable-diffusion-webui\n./webui.sh',
            },
            {
              type: 'callout',
              tone: 'info',
              text: 'webui.sh creates a Python environment and downloads dependencies on first run; it uses Metal (MPS) on Apple Silicon. Expect generation to be slower than on a discrete NVIDIA GPU.',
            },
          ],
        };
      case 'windows':
        return {
          title: 'Install SD WebUI on Windows',
          body: [
            {
              type: 'list',
              ordered: true,
              items: [
                'Install Python 3.10.6 (tick "Add to PATH") and Git for Windows.',
                'Clone the repo: git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui',
                'Double-click webui-user.bat inside the folder — it sets up the environment and starts the server.',
              ],
            },
            imageGpuNote(ctx.hardware),
            {
              type: 'callout',
              tone: 'tip',
              text: 'AMD GPU on Windows? The Forge fork or the DirectML branch works better than mainline A1111. NVIDIA works out of the box.',
            },
          ],
        };
      case 'linux':
      default:
        return {
          title: 'Install SD WebUI on Linux',
          body: [
            {
              type: 'paragraph',
              text: 'Install Python 3.10 and git, then clone and run the launch script (it builds its own venv):',
            },
            {
              type: 'code',
              lang: 'bash',
              code: '# Debian/Ubuntu\nsudo apt install python3.10-venv git wget\ngit clone https://github.com/AUTOMATIC1111/stable-diffusion-webui\ncd stable-diffusion-webui\n./webui.sh' +
                (ctx.hardware === 'amd-gpu' ? '  # ROCm is auto-detected on supported AMD cards' : ''),
            },
            imageGpuNote(ctx.hardware),
          ],
        };
    }
  },
  steps: [
    {
      slug: 'getmodel',
      title: 'Add a model and open the UI',
      body: [
        {
          type: 'paragraph',
          text: 'The WebUI needs at least one checkpoint to generate images:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Download a checkpoint (a .safetensors file) from Hugging Face or Civitai — an SDXL model is a great start.',
            'Put it in stable-diffusion-webui/models/Stable-diffusion/.',
            'Start the WebUI and open http://127.0.0.1:7860; pick your model from the dropdown at the top-left.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'The first launch downloads a default SD 1.5 model if none is present, so you can start even before adding your own.',
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
            'On the txt2img tab, type a prompt (and a negative prompt for things to avoid).',
            'Set width/height to match your model (e.g. 1024×1024 for SDXL) and keep sampling steps around 20–30 to start.',
            'Click Generate — the result appears on the right and is saved to the outputs folder.',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Out of memory? Lower the resolution, reduce batch size, or add --medvram to the launch arguments.',
        },
      ],
      choices: [
        { label: 'Tell me about extensions (ControlNet, upscaling)', to: 'advanced' },
        { label: "I've made an image — wrap up", to: 'done' },
      ],
    },
    {
      slug: 'advanced',
      title: 'Advanced: extensions & img2img',
      body: [
        {
          type: 'list',
          items: [
            'Extensions tab: install ControlNet (pose/depth/edge guidance), upscalers, and ADetailer for face fixes — one of the largest plugin ecosystems in local image gen.',
            'img2img & inpainting: start from an existing image, or mask a region to regenerate just that part.',
            'LoRA: drop LoRA files into models/Lora and invoke them in the prompt to apply fine-tuned styles.',
            'Forge fork: switch to lllyasviel/stable-diffusion-webui-forge for FLUX/SD3.5 support and better performance with the same UI.',
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
          text: 'You have a private image studio with a deep extension ecosystem. From here you might:',
        },
        {
          type: 'list',
          items: [
            'Install ControlNet for precise control over composition and pose.',
            'Collect a few LoRAs to apply consistent styles or characters.',
            'Move to the Forge fork (or ComfyUI) when you want the latest FLUX/video models.',
          ],
        },
      ],
      terminal: true,
      choices: [{ label: 'Explore another tool or path', to: EXPLORE_TARGET }],
    },
  ],
};
