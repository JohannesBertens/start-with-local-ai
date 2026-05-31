import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';
import { gpuNote } from './shared';

export const llamacpp: ToolDef = {
  id: 'llamacpp',
  label: 'llama.cpp',
  summary: 'The lean, bare-metal engine — most control.',
  info: [
    {
      type: 'paragraph',
      text: 'llama.cpp is the open-source (MIT) C/C++ inference engine that powers much of the local-AI ecosystem — Ollama and LM Studio both build on it. It runs quantized GGUF models with minimal dependencies and squeezes strong performance out of almost any hardware.',
    },
    {
      type: 'list',
      items: [
        'Best for: maximum control and performance, and for understanding what the friendlier tools do under the hood.',
        'Format: GGUF single-file models (download from Hugging Face), with quantizations from Q2 up to Q8 and tools to quantize your own.',
        'Backends: CPU (AVX/NEON), CUDA (NVIDIA), HIP/ROCm (AMD), Metal (Apple Silicon), and Vulkan for broad GPU support.',
        'Tools: llama-cli for interactive chat and llama-server for a built-in web UI plus an OpenAI-compatible API. Prebuilt binaries and Docker images are published per release.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'The single biggest speed lever is -ngl (GPU layer offload): raise it until VRAM is nearly full.',
    },
  ],
  supports: () => true, // builds/runs on every OS and hardware profile
  install: (ctx) => {
    switch (ctx.os) {
      case 'macos':
        return {
          title: 'Build llama.cpp on macOS',
          body: [
            {
              type: 'paragraph',
              text: 'The easiest path on macOS is Homebrew, which gives you the llama-cli and llama-server commands directly:',
            },
            { type: 'code', lang: 'bash', code: 'brew install llama.cpp' },
            { type: 'heading', text: 'Or build from source (latest features)' },
            {
              type: 'code',
              lang: 'bash',
              code: 'git clone https://github.com/ggml-org/llama.cpp\ncd llama.cpp\ncmake -B build\ncmake --build build --config Release -j',
            },
            {
              type: 'callout',
              tone: 'info',
              text: 'On Apple Silicon the build enables Metal GPU acceleration automatically — no flags needed.',
            },
          ],
        };
      case 'docker':
        return {
          title: 'Run llama.cpp in Docker',
          body: [
            {
              type: 'paragraph',
              text: 'The project publishes ready-made server images. The CPU image works anywhere:',
            },
            {
              type: 'code',
              lang: 'bash',
              code: 'docker run -p 8080:8080 -v ./models:/models ghcr.io/ggml-org/llama.cpp:server \\\n  -m /models/model.gguf -c 8192 --host 0.0.0.0 --port 8080',
            },
            { type: 'heading', text: 'With an NVIDIA GPU' },
            {
              type: 'paragraph',
              text: 'Install the NVIDIA Container Toolkit on the host, then use the CUDA image with "--gpus all":',
            },
            {
              type: 'code',
              lang: 'bash',
              code: 'docker run --gpus all -p 8080:8080 -v ./models:/models \\\n  ghcr.io/ggml-org/llama.cpp:server-cuda \\\n  -m /models/model.gguf -ngl 999 --host 0.0.0.0 --port 8080',
            },
            {
              type: 'callout',
              tone: 'tip',
              text: 'Mount a folder of .gguf files into /models so the container can load them. There are also :server-rocm and :server-intel images for AMD and Intel GPUs.',
            },
          ],
        };
      case 'windows':
        return {
          title: 'Get llama.cpp on Windows',
          body: [
            {
              type: 'paragraph',
              text: 'The fastest route on Windows is the prebuilt binaries — no compiler required.',
            },
            {
              type: 'list',
              ordered: true,
              items: [
                'Open the llama.cpp releases page: https://github.com/ggml-org/llama.cpp/releases',
                ctx.hardware === 'nvidia-gpu'
                  ? 'Download the latest "llama-<version>-bin-win-cuda-*.zip" CUDA build to match your NVIDIA GPU.'
                  : ctx.hardware === 'amd-gpu' || ctx.hardware === 'amd-strix'
                    ? 'Download the latest "llama-<version>-bin-win-hip-*.zip" (HIP/ROCm) build for your AMD GPU, or the Vulkan build if HIP is unavailable.'
                    : 'Download the latest "llama-<version>-bin-win-*.zip". Use the AVX2/CPU build, or a Vulkan build to use any GPU.',
                'Unzip it to a folder, e.g. C:\\llama.cpp, and open a terminal in that folder.',
              ],
            },
            gpuNote(ctx.hardware),
            {
              type: 'callout',
              tone: 'tip',
              text: 'Prefer to build from source? Install Git and CMake, then "cmake -B build && cmake --build build --config Release". The prebuilt binaries are simpler to start with.',
            },
          ],
        };
      case 'linux':
      default:
        return {
          title: 'Build llama.cpp on Linux',
          body: [
            {
              type: 'paragraph',
              text: 'Compiling from source takes a couple of minutes and gives the best performance for your exact hardware.',
            },
            {
              type: 'code',
              lang: 'bash',
              code: '# Build tools (Debian/Ubuntu)\nsudo apt install build-essential cmake git\n\ngit clone https://github.com/ggml-org/llama.cpp\ncd llama.cpp',
            },
            ...(ctx.hardware === 'amd-gpu' || ctx.hardware === 'amd-strix'
              ? [
                  { type: 'heading' as const, text: 'Configure with ROCm (AMD)' },
                  {
                    type: 'code' as const,
                    lang: 'bash',
                    code: 'cmake -B build -DGGML_HIP=ON\ncmake --build build --config Release -j',
                  },
                ]
              : ctx.hardware === 'cpu'
                ? [
                    { type: 'heading' as const, text: 'CPU build' },
                    {
                      type: 'code' as const,
                      lang: 'bash',
                      code: 'cmake -B build\ncmake --build build --config Release -j',
                    },
                  ]
                : [
                    { type: 'heading' as const, text: 'Configure with CUDA (NVIDIA)' },
                    {
                      type: 'code' as const,
                      lang: 'bash',
                      code: 'cmake -B build -DGGML_CUDA=ON\ncmake --build build --config Release -j',
                    },
                  ]),
            gpuNote(ctx.hardware),
            {
              type: 'callout',
              tone: 'tip',
              text: 'The binaries land in ./build/bin — look for llama-cli and llama-server.',
            },
          ],
        };
    }
  },
  steps: [
    {
      slug: 'getmodel',
      title: 'Get a model (GGUF)',
      body: [
        {
          type: 'paragraph',
          text: 'Unlike Ollama or LM Studio, llama.cpp does not manage models for you. It runs GGUF files — a single-file format you download yourself, usually from Hugging Face.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'On https://huggingface.co search for a model name plus "GGUF" (e.g. "Llama-3.2-3B-Instruct GGUF").',
            'Open a repository from a quantizer such as "bartowski" or "unsloth".',
            'In the Files tab, download one .gguf file. A "Q4_K_M" quant is the popular quality/size balance.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'The quant in the filename trades size for quality: Q8 is near-lossless but large; Q4_K_M is a great default; Q2/Q3 are tiny but noticeably weaker.',
        },
      ],
      nextSlug: 'run',
    },
    {
      slug: 'run',
      title: 'Run your model',
      body: [
        {
          type: 'paragraph',
          text: 'Point llama-cli at your downloaded GGUF and start an interactive conversation:',
        },
        { type: 'code', lang: 'bash', code: 'llama-cli -m ./Llama-3.2-3B-Instruct-Q4_K_M.gguf -cnv' },
        {
          type: 'paragraph',
          text: 'The "-cnv" flag enables conversation mode. A few flags you will reach for often:',
        },
        {
          type: 'code',
          lang: 'text',
          code: '-m   <file>   path to the .gguf model\n-cnv          interactive chat mode\n-ngl <n>      offload n layers to the GPU (use 999 for all)\n-c   <n>      context size in tokens (e.g. 4096)\n-t   <n>      CPU threads to use',
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Using prebuilt Windows binaries? The command is "llama-cli.exe" run from the unzipped folder. On a source build, it lives in ./build/bin.',
        },
      ],
      choices: [
        { label: 'Go deeper — run the built-in server & tune performance', to: 'advanced' },
        { label: "I'm chatting in the terminal — wrap up", to: 'done' },
      ],
    },
    {
      slug: 'advanced',
      title: 'Advanced: llama-server, GPU offload & quantization',
      body: [
        { type: 'heading', text: 'Serve an OpenAI-compatible API' },
        {
          type: 'paragraph',
          text: 'llama-server gives you both a built-in web chat UI and an OpenAI-compatible API on one port:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'llama-server -m ./model.gguf -c 8192 -ngl 999 --host 0.0.0.0 --port 8080',
        },
        {
          type: 'paragraph',
          text: 'Open http://localhost:8080 for the chat UI, or POST to http://localhost:8080/v1/chat/completions from your own code.',
        },
        { type: 'heading', text: 'Squeeze out performance' },
        {
          type: 'list',
          items: [
            '-ngl: raise GPU layer offload until VRAM is nearly full — this is the single biggest speed lever.',
            '-c: larger context lets the model "remember" more, but uses more memory.',
            '--flash-attn: enable flash attention on supported GPUs for extra speed and lower memory.',
            '-t: match CPU threads to your physical core count for CPU-only runs.',
          ],
        },
        { type: 'heading', text: 'Quantize a model yourself' },
        {
          type: 'paragraph',
          text: 'If you have an unquantized GGUF, the llama-quantize tool shrinks it:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'llama-quantize ./model-f16.gguf ./model-q4_k_m.gguf Q4_K_M',
        },
        {
          type: 'callout',
          tone: 'warning',
          text: 'Binding the server to 0.0.0.0 exposes it to your whole network. Use 127.0.0.1 unless you specifically want LAN access, and never expose it directly to the internet without a proxy and auth.',
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
          text: 'You are now driving the same engine that powers much of the local-AI world — directly. From here you can:',
        },
        {
          type: 'list',
          items: [
            'Experiment with different quantizations to balance speed, memory, and quality.',
            'Use llama-server as a private OpenAI-compatible backend for your apps.',
            'Tune -ngl and -c to get the most from your specific hardware.',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Want something more hands-off for everyday use? Ollama and LM Studio wrap this same engine in a friendlier shell — explore another path below.',
        },
      ],
      terminal: true,
      choices: [{ label: 'Explore another tool or operating system', to: EXPLORE_TARGET }],
    },
  ],
};
