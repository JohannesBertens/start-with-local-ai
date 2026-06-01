import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';
import { gpuNote } from './shared';

export const ollama: ToolDef = {
  id: 'ollama',
  label: 'Ollama',
  useCases: ['chat', 'coding'],
  summary: 'Simplest command-line start.',
  info: [
    {
      type: 'paragraph',
      text: 'Ollama is a free, open-source (MIT) runtime that makes running open models feel as simple as a package manager: "ollama pull" to download and "ollama run" to chat. It bundles a llama.cpp-based engine, automatic GPU detection, and a model library behind one friendly command.',
    },
    {
      type: 'list',
      items: [
        'Best for: getting a model running in minutes with zero configuration.',
        'Models: Llama, Mistral, Qwen, Gemma, Phi, DeepSeek and many more from ollama.com/library, plus any GGUF you import via a Modelfile.',
        'API: a built-in server on port 11434 with both a native API and an OpenAI-compatible /v1 endpoint, so existing OpenAI SDK code works by changing only the base URL.',
        'Platforms: native apps for Windows, macOS (Metal/MLX on Apple Silicon), and Linux, plus an official Docker image (CPU, NVIDIA, and ROCm tags).',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'Great default first stop. Tools like Open WebUI talk to Ollama out of the box, and you can later expose it on your LAN with OLLAMA_HOST.',
    },
  ],
  supports: () => true, // runs everywhere: all OSes and hardware profiles
  install: (ctx) => {
    switch (ctx.os) {
      case 'windows':
        return {
          title: 'Install Ollama on Windows',
          body: [
            {
              type: 'list',
              ordered: true,
              items: [
                'Open https://ollama.com/download in your browser and download the Windows installer (OllamaSetup.exe).',
                'Run the installer and accept the defaults. Ollama installs as a background service and adds the "ollama" command to your PATH.',
                'Open a new terminal — PowerShell or Windows Terminal — so it picks up the updated PATH.',
              ],
            },
            { type: 'paragraph', text: 'Confirm it is installed by checking the version:' },
            { type: 'code', lang: 'powershell', code: 'ollama --version' },
            gpuNote(ctx.hardware),
            {
              type: 'callout',
              tone: 'tip',
              text: 'If "ollama" is not recognized, close and reopen the terminal. PATH changes only apply to newly opened windows.',
            },
          ],
        };
      case 'macos':
        return {
          title: 'Install Ollama on macOS',
          body: [
            {
              type: 'list',
              ordered: true,
              items: [
                'Download the macOS app from https://ollama.com/download and drag Ollama into your Applications folder.',
                'Launch Ollama once from Applications — it sets up the background service and the command-line tool.',
                'Prefer Homebrew? You can instead run the command below.',
              ],
            },
            { type: 'code', lang: 'bash', code: 'brew install ollama' },
            { type: 'paragraph', text: 'Verify the install:' },
            { type: 'code', lang: 'bash', code: 'ollama --version' },
            {
              type: 'callout',
              tone: 'info',
              text: 'On Apple Silicon (M1–M4) Ollama uses the GPU automatically via Metal. No extra drivers needed.',
            },
          ],
        };
      case 'docker':
        return {
          title: 'Run Ollama in Docker',
          body: [
            { type: 'paragraph', text: 'The official image runs the Ollama server in a container:' },
            {
              type: 'code',
              lang: 'bash',
              code: 'docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama',
            },
            {
              type: 'paragraph',
              text: 'For NVIDIA GPUs install the NVIDIA Container Toolkit on the host, then add "--gpus=all":',
            },
            {
              type: 'code',
              lang: 'bash',
              code: 'docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama',
            },
            { type: 'paragraph', text: 'Run a model inside the running container:' },
            { type: 'code', lang: 'bash', code: 'docker exec -it ollama ollama run qwen3.5' },
            {
              type: 'callout',
              tone: 'tip',
              text: 'AMD GPUs: use the "ollama/ollama:rocm" image and pass the /dev/kfd and /dev/dri devices instead of --gpus.',
            },
          ],
        };
      case 'linux':
      default:
        return {
          title: 'Install Ollama on Linux',
          body: [
            { type: 'paragraph', text: 'The official one-line installer handles everything:' },
            { type: 'code', lang: 'bash', code: 'curl -fsSL https://ollama.com/install.sh | sh' },
            {
              type: 'paragraph',
              text: 'It installs the binary, creates a systemd service, and detects an NVIDIA or AMD GPU if present. Check the version:',
            },
            { type: 'code', lang: 'bash', code: 'ollama --version' },
            gpuNote(ctx.hardware),
          ],
        };
    }
  },
  steps: [
    {
      slug: 'firstrun',
      title: 'Run your first model',
      body: [
        {
          type: 'paragraph',
          text: 'Now the magic moment. This single command downloads a small, capable model and drops you into a chat with it:',
        },
        { type: 'code', lang: 'bash', code: 'ollama run qwen3.5' },
        {
          type: 'paragraph',
          text: 'The first run downloads the model (a couple of gigabytes), then shows a ">>>" prompt. Type a message, press Enter, and watch it respond entirely from your machine.',
        },
        {
          type: 'list',
          items: [
            'Type your question and press Enter to chat.',
            'Type /bye (or press Ctrl+D) to leave the chat.',
            'Run the same command again later — the model is cached, so it starts instantly.',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Short on memory or patience? Try an even smaller model: "ollama run qwen3.5:2b" or "ollama run qwen3.5:0.8b".',
        },
      ],
      nextSlug: 'usage',
    },
    {
      slug: 'usage',
      title: 'Living with Ollama',
      body: [
        { type: 'paragraph', text: 'A few commands cover almost everything day to day:' },
        {
          type: 'code',
          lang: 'bash',
          code: 'ollama list        # models you have downloaded\nollama pull mistral # download without running\nollama rm qwen3.5   # delete a model to free disk space\nollama ps          # what is currently loaded in memory',
        },
        {
          type: 'paragraph',
          text: 'Browse the full catalogue at https://ollama.com/library — Llama, Mistral, Qwen, Gemma, Phi, plus vision and coding-specialised models. Larger models (more billions of parameters) are smarter but need more RAM/VRAM and run slower.',
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'Rule of thumb: a model needs roughly its file size in free RAM (or VRAM on a GPU). An 8B model in 4-bit is ~5 GB.',
        },
      ],
      choices: [
        {
          label: 'Go deeper — use Ollama as a local API server',
          to: 'advanced',
          hint: 'Build apps, scripts, and OpenAI-compatible integrations.',
        },
        { label: "I'm happy chatting — wrap up", to: 'done' },
      ],
    },
    {
      slug: 'advanced',
      title: 'Advanced: the Ollama API & Modelfiles',
      body: [
        {
          type: 'paragraph',
          text: 'Whenever Ollama is running it also serves an HTTP API on http://localhost:11434. That turns your machine into a private AI backend.',
        },
        { type: 'heading', text: 'Call it directly' },
        {
          type: 'code',
          lang: 'bash',
          code: 'curl http://localhost:11434/api/generate -d \'{\n  "model": "qwen3.5",\n  "prompt": "Explain local AI in one sentence.",\n  "stream": false\n}\'',
        },
        { type: 'heading', text: 'Use the OpenAI-compatible endpoint' },
        {
          type: 'paragraph',
          text: 'Ollama mimics the OpenAI API, so most OpenAI SDKs work by changing only the base URL. Point your client at:',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'base_url: http://localhost:11434/v1\napi_key:  ollama   (any non-empty string works)',
        },
        { type: 'heading', text: 'Customise a model with a Modelfile' },
        {
          type: 'paragraph',
          text: 'A Modelfile bakes a system prompt and parameters into a reusable model:',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'FROM qwen3.5\nPARAMETER temperature 0.3\nSYSTEM "You are a terse senior engineer. Answer in at most three sentences."',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'ollama create terse-eng -f ./Modelfile\nollama run terse-eng',
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Set OLLAMA_HOST=0.0.0.0 before starting the service to reach your models from other devices on your LAN. Only do this on networks you trust.',
        },
      ],
      nextSlug: 'done',
    },
    {
      slug: 'done',
      title: 'You are running local AI 🎉',
      body: [
        {
          type: 'paragraph',
          text: 'That is it — you have a private model running on your own hardware with Ollama. From here you might:',
        },
        {
          type: 'list',
          items: [
            'Try a few models and keep the one that fits your machine best.',
            'Connect a friendly chat UI like Open WebUI (it speaks to Ollama out of the box).',
            'Wire Ollama into your editor or scripts via the OpenAI-compatible API.',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Curious how the other tools compare? Explore another path below — your progress stays saved, and the Reset button up top starts fresh any time.',
        },
      ],
      terminal: true,
      choices: [{ label: 'Explore another tool or operating system', to: EXPLORE_TARGET }],
    },
  ],
};
