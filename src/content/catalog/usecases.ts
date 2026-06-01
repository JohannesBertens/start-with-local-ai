import type { UseCaseDef } from './types';

/**
 * Use cases offered on the "what do you want to do?" step, shown before the
 * platform (OS) question. Each one routes into its own tool funnel so the
 * adventure can present the handful of tools that actually fit the goal.
 */
export const useCases: UseCaseDef[] = [
  {
    id: 'chat',
    label: 'Chat with a model',
    hint: 'Talk to an assistant, ask questions, draft and summarise text.',
    info: [
      {
        type: 'paragraph',
        text: 'The most common reason to run local AI: a private ChatGPT-style assistant on your own machine. You download an open chat model (Llama, Qwen, Mistral, Gemma, Phi) and talk to it in a terminal, a desktop app, or a web UI — with nothing leaving your computer.',
      },
      {
        type: 'list',
        items: [
          'Best for: everyday Q&A, writing and summarising, brainstorming, and learning — fully offline and private.',
          'Tools here: Ollama and llama.cpp (command-line + API), and the desktop apps LM Studio, Jan, and GPT4All (point-and-click chat windows).',
          'Hardware-friendly: small quantized models run on a plain laptop; a GPU only makes them faster or lets you run bigger ones.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'Not sure where to start? This is the path most newcomers want — pick a friendly desktop app and you are chatting in minutes.',
      },
    ],
  },
  {
    id: 'image-video',
    label: 'Generate images or video',
    hint: 'Create pictures (and video) from text with Stable Diffusion / FLUX.',
    info: [
      {
        type: 'paragraph',
        text: 'Run text-to-image (and increasingly text-to-video) models like Stable Diffusion, SDXL, SD3.5, and FLUX entirely on your own GPU. You type a prompt and the tool paints an image; newer pipelines add video, inpainting, ControlNet guidance, and LoRA fine-tunes.',
      },
      {
        type: 'list',
        items: [
          'Best for: art, concept design, product mockups, and short AI video clips — without per-image cloud fees.',
          'Tools here: ComfyUI (node-based, best for video and the newest models), AUTOMATIC1111 / Forge (classic web UI), Fooocus (simplest), InvokeAI (canvas/inpainting), and SD.Next.',
          'Wants a GPU: image and video models lean heavily on VRAM — an NVIDIA GPU is smoothest, AMD and Apple Silicon work, and CPU-only is possible but slow.',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'These are GPU-hungry desktop tools, so this path focuses on Windows, macOS, and Linux rather than headless Docker.',
      },
    ],
  },
  {
    id: 'coding',
    label: 'Run an inference server (coding & apps)',
    hint: 'Serve an OpenAI-compatible API for code completion, agents, and apps.',
    info: [
      {
        type: 'paragraph',
        text: 'Stand up a local inference server that exposes an OpenAI-compatible API, then point your editor, scripts, or app at it. This powers private code completion (Copilot-style), coding assistants, RAG, and agents — with your code never leaving your network.',
      },
      {
        type: 'list',
        items: [
          'Best for: self-hosted code completion in VS Code / JetBrains, building apps and agents, and high-throughput serving.',
          'Tools here: Ollama and llama.cpp (easy local servers), vLLM and SGLang (high-throughput GPU engines), and Tabby (a self-hosted Copilot alternative with IDE plugins).',
          'Scales with hardware: a laptop serves small coding models; an NVIDIA GPU unlocks the fast serving engines and bigger models.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'Pick this if you want to wire a model into your tools rather than just chat — most options here speak the OpenAI API, so existing clients work by changing only the base URL.',
      },
    ],
  },
];

const useCaseById = new Map(useCases.map((u) => [u.id, u]));

export function getUseCase(id: string): UseCaseDef | undefined {
  return useCaseById.get(id as UseCaseDef['id']);
}
