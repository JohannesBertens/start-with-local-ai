import type { Story } from './types';

export const ollamaNodes: Story = {
  'ollama-win-install': {
    id: 'ollama-win-install',
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
      {
        type: 'paragraph',
        text: 'Confirm it is installed by checking the version:',
      },
      { type: 'code', lang: 'powershell', code: 'ollama --version' },
      {
        type: 'callout',
        tone: 'tip',
        text: 'If "ollama" is not recognized, close and reopen the terminal. PATH changes only apply to newly opened windows.',
      },
    ],
    next: 'ollama-firstrun',
  },

  'ollama-mac-install': {
    id: 'ollama-mac-install',
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
    next: 'ollama-firstrun',
  },

  'ollama-linux-install': {
    id: 'ollama-linux-install',
    title: 'Install Ollama on Linux',
    body: [
      { type: 'paragraph', text: 'The official one-line installer handles everything:' },
      {
        type: 'code',
        lang: 'bash',
        code: 'curl -fsSL https://ollama.com/install.sh | sh',
      },
      {
        type: 'paragraph',
        text: 'It installs the binary, creates a systemd service, and detects an NVIDIA or AMD GPU if present. Check the version:',
      },
      { type: 'code', lang: 'bash', code: 'ollama --version' },
      {
        type: 'callout',
        tone: 'tip',
        text: 'Have an NVIDIA GPU? Make sure the proprietary drivers are installed — the script will then use CUDA automatically. No GPU is fine too; models run on the CPU, just slower.',
      },
    ],
    next: 'ollama-firstrun',
  },

  'ollama-firstrun': {
    id: 'ollama-firstrun',
    title: 'Run your first model',
    body: [
      {
        type: 'paragraph',
        text: 'Now the magic moment. This single command downloads a small, capable model and drops you into a chat with it:',
      },
      { type: 'code', lang: 'bash', code: 'ollama run llama3.2' },
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
        text: 'Short on memory or patience? Try an even smaller model: "ollama run llama3.2:1b" or "ollama run qwen2.5:0.5b".',
      },
    ],
    next: 'ollama-usage',
  },

  'ollama-usage': {
    id: 'ollama-usage',
    title: 'Living with Ollama',
    body: [
      { type: 'paragraph', text: 'A few commands cover almost everything day to day:' },
      {
        type: 'code',
        lang: 'bash',
        code: 'ollama list        # models you have downloaded\nollama pull mistral # download without running\nollama rm llama3.2  # delete a model to free disk space\nollama ps          # what is currently loaded in memory',
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
        to: 'ollama-advanced',
        hint: 'Build apps, scripts, and OpenAI-compatible integrations.',
      },
      {
        label: "I'm happy chatting — wrap up",
        to: 'ollama-done',
      },
    ],
  },

  'ollama-advanced': {
    id: 'ollama-advanced',
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
        code: 'curl http://localhost:11434/api/generate -d \'{\n  "model": "llama3.2",\n  "prompt": "Explain local AI in one sentence.",\n  "stream": false\n}\'',
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
        code: 'FROM llama3.2\nPARAMETER temperature 0.3\nSYSTEM "You are a terse senior engineer. Answer in at most three sentences."',
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
    next: 'ollama-done',
  },

  'ollama-done': {
    id: 'ollama-done',
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
    choices: [
      {
        label: 'Explore another tool or operating system',
        to: 'choose-os',
      },
    ],
  },
};
