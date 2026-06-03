import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';
import { gpuNote } from './shared';

export const tabby: ToolDef = {
  id: 'tabby',
  label: 'Tabby',
  useCases: ['coding'],
  summary: 'Self-hosted Copilot: code completion with IDE plugins.',
  info: [
    {
      type: 'paragraph',
      text: 'Tabby is an open-source (Apache 2.0) self-hosted coding assistant — a privacy-friendly alternative to GitHub Copilot. You run the Tabby server locally and install its VS Code or JetBrains plugin; code completion and chat then come from a model on your own hardware, so your source never leaves your network.',
    },
    {
      type: 'list',
      items: [
        'Best for: private, in-editor code completion and chat for an individual or a small team.',
        'Models: ships with curated code models (StarCoder2, DeepSeek Coder, CodeLlama, Qwen2.5-Coder) and can also front an OpenAI-compatible backend like vLLM or Ollama.',
        'Built-in: a web UI, user accounts, and Git-repository context so completions are aware of your codebase.',
        'Platforms: prebuilt binaries for Windows, macOS, and Linux, plus official Docker images (CPU and CUDA).',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'A GPU is recommended for snappy completions, but a small coding model runs on CPU for trying it out.',
    },
  ],
  supports: () => true, // runs on every OS, and as a Docker container
  install: (ctx) => {
    switch (ctx.os) {
      case 'docker':
        return {
          title: 'Run Tabby in Docker',
          body: [
            {
              type: 'paragraph',
              text: 'The official image starts a Tabby server with a chosen completion model. Install the NVIDIA Container Toolkit on the host for GPU acceleration, then:',
            },
            {
              type: 'code',
              lang: 'bash',
              code: 'docker run -it --gpus all -p 8080:8080 \\\n  -v $HOME/.tabby:/data \\\n  registry.tabbyml.com/tabbyml/tabby \\\n  serve --model StarCoder2-3B --device cuda',
            },
            {
              type: 'paragraph',
              text: 'No GPU? Drop "--gpus all" and "--device cuda" to run on CPU:',
            },
            {
              type: 'code',
              lang: 'bash',
              code: 'docker run -it -p 8080:8080 -v $HOME/.tabby:/data \\\n  registry.tabbyml.com/tabbyml/tabby serve --model StarCoder2-3B',
            },
            {
              type: 'callout',
              tone: 'info',
              text: 'The -v mount persists downloaded models and config in ~/.tabby so they survive container restarts.',
            },
          ],
        };
      case 'macos':
        return {
          title: 'Install Tabby on macOS',
          body: [
            {
              type: 'paragraph',
              text: 'On Apple Silicon the easiest route is Homebrew, which builds with Metal acceleration:',
            },
            { type: 'code', lang: 'bash', code: 'brew install tabbyml/tabby/tabby' },
            { type: 'paragraph', text: 'Then start the server:' },
            { type: 'code', lang: 'bash', code: 'tabby serve --model StarCoder2-3B --device metal' },
            {
              type: 'callout',
              tone: 'info',
              text: 'You can also download a prebuilt binary from the GitHub releases page if you prefer not to use Homebrew.',
            },
          ],
        };
      case 'windows':
        return {
          title: 'Get Tabby on Windows',
          body: [
            {
              type: 'list',
              ordered: true,
              items: [
                'Open the releases page: https://github.com/TabbyML/tabby/releases',
                ctx.hardware === 'nvidia-gpu'
                  ? 'Download the CUDA build (tabby_x86_64-windows-msvc-cuda*.zip) to use your NVIDIA GPU.'
                  : 'Download the CPU build (tabby_x86_64-windows-msvc.zip); add a GPU build later for more speed.',
                'Unzip it, open a terminal in that folder, and start the server.',
              ],
            },
            {
              type: 'code',
              lang: 'powershell',
              code: ctx.hardware === 'nvidia-gpu'
                ? '.\\tabby.exe serve --model StarCoder2-3B --device cuda'
                : '.\\tabby.exe serve --model StarCoder2-3B',
            },
            gpuNote(ctx.hardware, ctx.ramGb),
          ],
        };
      case 'linux':
      default:
        return {
          title: 'Install Tabby on Linux',
          body: [
            {
              type: 'paragraph',
              text: 'Download a prebuilt binary from the releases page (pick the CUDA build for an NVIDIA GPU), make it executable, and serve a model:',
            },
            {
              type: 'code',
              lang: 'bash',
              code: ctx.hardware === 'nvidia-gpu' || ctx.hardware === 'nvidia-spark'
                ? '# from https://github.com/TabbyML/tabby/releases\nchmod +x tabby\n./tabby serve --model StarCoder2-3B --device cuda'
                : '# from https://github.com/TabbyML/tabby/releases\nchmod +x tabby\n./tabby serve --model StarCoder2-3B',
            },
            gpuNote(ctx.hardware, ctx.ramGb),
          ],
        };
    }
  },
  steps: [
    {
      slug: 'serve',
      title: 'Start the server',
      body: [
        {
          type: 'paragraph',
          text: 'The first time you run "tabby serve" it downloads the chosen model, then serves a web UI and API on port 8080:',
        },
        { type: 'code', lang: 'text', code: 'http://localhost:8080' },
        {
          type: 'paragraph',
          text: 'Open that URL to finish setup: create the first account (it becomes the admin) and copy the API token shown in your account settings — the IDE plugin needs it.',
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Pick a small model like StarCoder2-3B to start. Bigger coding models (DeepSeek-Coder, Qwen2.5-Coder) give better completions but need more VRAM.',
        },
      ],
      nextSlug: 'connect',
    },
    {
      slug: 'connect',
      title: 'Connect your editor',
      body: [
        {
          type: 'paragraph',
          text: 'Install the Tabby extension and point it at your local server:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'In VS Code, install the "Tabby" extension from the Marketplace (JetBrains users: install the Tabby plugin).',
            'Open the Tabby settings and set the server endpoint to http://localhost:8080.',
            'Paste the API token you copied from the web UI.',
            'Start typing in a file — grey "ghost text" suggestions appear; press Tab to accept.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'Tabby also adds an in-editor chat panel for explaining code, writing tests, and answering questions about your repository.',
        },
      ],
      choices: [
        { label: 'Go deeper — repo context & a stronger backend', to: 'advanced' },
        { label: 'Completions are working — wrap up', to: 'done' },
      ],
    },
    {
      slug: 'advanced',
      title: 'Advanced: code context & external backends',
      body: [
        { type: 'heading', text: 'Index your repositories' },
        {
          type: 'paragraph',
          text: 'In the web UI, add Git repositories under Settings → Context. Tabby indexes them so completions and chat are aware of your own code, not just the base model.',
        },
        { type: 'heading', text: 'Front a faster backend' },
        {
          type: 'paragraph',
          text: 'For a stronger model or higher throughput, run vLLM (or Ollama) and have Tabby use it as an OpenAI-compatible backend instead of its built-in engine — configure the http endpoint in ~/.tabby/config.toml.',
        },
        {
          type: 'callout',
          tone: 'warning',
          text: 'If you expose Tabby beyond localhost, keep authentication on and put it behind a reverse proxy with TLS. Never expose it directly to the internet without auth.',
        },
      ],
      nextSlug: 'done',
    },
    {
      slug: 'done',
      title: 'You have a private Copilot 🎉',
      body: [
        {
          type: 'paragraph',
          text: 'Code completion and chat now run on your own hardware, with your source staying on your network. From here you might:',
        },
        {
          type: 'list',
          items: [
            'Index your main repositories so suggestions match your codebase conventions.',
            'Try a larger coding model once you know your GPU can serve it quickly.',
            'Point Tabby at a vLLM backend to share one powerful server across a team.',
          ],
        },
      ],
      terminal: true,
      choices: [{ label: 'Explore another tool or path', to: EXPLORE_TARGET }],
    },
  ],
};
