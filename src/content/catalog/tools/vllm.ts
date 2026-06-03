import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';
import { GPU_HARDWARE } from './shared';

export const vllm: ToolDef = {
  id: 'vllm',
  label: 'vLLM',
  useCases: ['coding'],
  summary: 'High-throughput GPU serving engine (OpenAI-compatible).',
  info: [
    {
      type: 'paragraph',
      text: 'vLLM is an open-source (Apache 2.0) inference and serving engine built for throughput. Its PagedAttention manages the KV cache like OS virtual memory — in small, non-contiguous pages — which cuts memory waste to a few percent and lets one GPU serve many concurrent requests.',
    },
    {
      type: 'list',
      items: [
        'Best for: production serving and high-concurrency workloads with many distinct prompts.',
        'Key features: PagedAttention, continuous batching, native MTP (Multi-Token Prediction) support for up to 3× faster inference on compatible models, speculative decoding, and quantization (AWQ/GPTQ/FP8).',
        'Hardware: the broadest reach of these engines — NVIDIA and AMD GPUs, plus AWS Trainium, Google TPU, and Intel Gaudi.',
        'API: serves an OpenAI-compatible endpoint, so existing OpenAI clients work by pointing at your local server.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      text: 'Runs natively on Linux GPUs or via the official Docker image; it needs a capable GPU and does not meaningfully run on CPU.',
    },
  ],
  // A GPU inference server: native on Linux GPUs, or via Docker.
  supports: (ctx) => {
    if (ctx.os === 'docker') return true;
    if (ctx.os === 'linux') return !!ctx.hardware && GPU_HARDWARE.includes(ctx.hardware);
    return false;
  },
  install: (ctx) => {
    if (ctx.os === 'docker') {
      return {
        title: 'Run vLLM in Docker',
        body: [
          {
            type: 'paragraph',
            text: 'The official image serves an OpenAI-compatible API. Install the NVIDIA Container Toolkit on the host, then:',
          },
          {
            type: 'code',
            lang: 'bash',
            code: 'docker run --gpus all -p 8000:8000 \\\n  -v ~/.cache/huggingface:/root/.cache/huggingface \\\n  vllm/vllm-openai:latest \\\n  --model Qwen/Qwen3.6-27B',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Mounting the Hugging Face cache avoids re-downloading weights on every run. For AMD GPUs, build/use the ROCm image (rocm/vllm) instead.',
          },
        ],
      };
    }
    // Linux native install.
    const rocm = ctx.hardware === 'amd-gpu';
    return {
      title: 'Install vLLM on Linux',
      body: [
        {
          type: 'paragraph',
          text: 'vLLM is a Python package. Install it into an isolated environment — uv (or venv) keeps it tidy:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: rocm
            ? '# AMD ROCm: follow the ROCm wheels/instructions\npython -m venv .venv && source .venv/bin/activate\npip install vllm  # see docs.vllm.ai for the ROCm build'
            : 'uv venv --python 3.12 && source .venv/bin/activate\nuv pip install vllm',
        },
        {
          type: 'callout',
          tone: ctx.hardware === 'nvidia-spark' ? 'info' : 'tip',
          text:
            ctx.hardware === 'nvidia-spark'
              ? 'On DGX Spark (ARM64/GB10) use the CUDA wheels built for aarch64; the large unified memory lets you serve sizeable models.'
              : 'vLLM needs a recent NVIDIA driver + CUDA. A GPU with enough VRAM for your model is required — it does not meaningfully run on CPU.',
        },
      ],
    };
  },
  steps: [
    {
      slug: 'serve',
      title: 'Serve a model',
      body: [
        {
          type: 'paragraph',
          text: 'vLLM ships an OpenAI-compatible server. Point it at a Hugging Face model id and it downloads and serves it:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'vllm serve Qwen/Qwen3.6-27B --port 8000',
        },
        {
          type: 'paragraph',
          text: 'The first launch downloads the weights, then the API is live on http://localhost:8000/v1. Handy flags:',
        },
        {
          type: 'code',
          lang: 'text',
          code: '--port <n>                     listen port (default 8000)\n--max-model-len <n>            cap context length to save VRAM\n--gpu-memory-utilization <f>   fraction of VRAM to use (e.g. 0.9)\n--tensor-parallel-size <n>     split across n GPUs',
        },
      ],
      nextSlug: 'use',
    },
    {
      slug: 'use',
      title: 'Call the API',
      body: [
        {
          type: 'paragraph',
          text: 'Any OpenAI-compatible client works — just point it at your local server:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'curl http://localhost:8000/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "model": "Qwen/Qwen3.6-27B",\n    "messages": [{"role": "user", "content": "Hello from vLLM!"}]\n  }\'',
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'vLLM shines under load: continuous batching and PagedAttention give very high throughput when many requests arrive at once.',
        },
      ],
      choices: [
        {
          label: 'Go deeper — performance & multi-GPU',
          to: 'advanced',
          hint: 'Quantization, tensor parallelism, and throughput tuning.',
        },
        {
          label: 'Try MTP — multi-token prediction for speed',
          to: 'mtp',
          hint: 'Up to 3× speedup with no quality loss on compatible models.',
        },
        { label: 'The server is up — wrap up', to: 'done' },
      ],
    },
    {
      slug: 'mtp',
      title: 'Multi-Token Prediction (MTP) — faster inference',
      body: [
        {
          type: 'paragraph',
          text: 'MTP (Multi-Token Prediction) is a speculative decoding technique where the model itself predicts several future tokens in parallel, rather than relying on a separate draft model. The main model verifies all draft tokens in a single forward pass — accepting them when they match, rejecting and correcting when they don\'t. The result: up to 3× faster generation with zero quality degradation.',
        },
        {
          type: 'heading',
          text: 'When to use MTP',
        },
        {
          type: 'list',
          items: [
            'Your model natively supports MTP heads (DeepSeek V3, Gemma 4, MiMo-7B, and many 2025–2026 models have built-in MTP modules).',
            'You want speculative decoding gains without managing a separate draft model or downloading extra checkpoints.',
            'You are latency-sensitive: chat, coding assistants, and agentic workflows benefit most.',
          ],
        },
        {
          type: 'heading',
          text: 'Enable MTP in vLLM',
        },
        {
          type: 'paragraph',
          text: 'Pass --speculative-config when starting the server:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'vllm serve google/gemma-4-26B-A4B-it \
  --tensor-parallel-size 1 \
  --max-model-len 8192 \
  --speculative-config \'{"method": "mtp", "num_speculative_tokens": 1}\'',
        },
        {
          type: 'paragraph',
          text: 'For models with a dedicated MTP drafter checkpoint (like Gemma 4\'s assistant models), pass the drafter in the config:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'vllm serve google/gemma-4-31B-it \
  --speculative-config \'{"method": "mtp", "model": "gg-hf-am/gemma-4-31B-it-assistant", "num_speculative_tokens": 1}\'',
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Start with num_speculative_tokens=1 and increase if your model supports a deeper draft. The deeper the draft, the bigger the potential speedup — but acceptance rates vary per model.',
        },
      ],
      nextSlug: 'advanced',
      nextLabel: 'More: multi-GPU & quantization →',
    },
    {
      slug: 'advanced',
      title: 'Advanced: throughput, quantization & multi-GPU',
      body: [
        {
          type: 'list',
          items: [
            '--tensor-parallel-size N: shard a large model across N GPUs on one host.',
            '--quantization awq|gptq|fp8: serve a quantized checkpoint to fit more in VRAM.',
            '--max-num-seqs: cap concurrent sequences to trade latency for memory.',
            '--gpu-memory-utilization: raise toward 0.95 to use more VRAM for the KV cache.',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          text: 'Binding to 0.0.0.0 exposes the server to your network. Keep it on localhost or behind a reverse proxy with auth for anything beyond your own machine.',
        },
      ],
      nextSlug: 'done',
    },
    {
      slug: 'done',
      title: 'You are serving local AI 🎉',
      body: [
        {
          type: 'paragraph',
          text: 'You now have a production-grade inference server running on your own GPU. Next steps:',
        },
        {
          type: 'list',
          items: [
            'Drop the base URL into your existing OpenAI SDK code — no other changes needed.',
            'Benchmark throughput with concurrent requests to see vLLM batching shine.',
            'Try a quantized checkpoint to serve a bigger model on the same card.',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Want a lighter-weight or more interactive option? Explore another path below — your progress stays saved.',
        },
      ],
      terminal: true,
      choices: [{ label: 'Explore another tool or operating system', to: EXPLORE_TARGET }],
    },
  ],
};
