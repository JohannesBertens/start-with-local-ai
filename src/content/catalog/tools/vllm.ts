import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';
import { GPU_HARDWARE } from './shared';

export const vllm: ToolDef = {
  id: 'vllm',
  label: 'vLLM',
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
        'Key features: PagedAttention, continuous batching, speculative decoding, and quantization (AWQ/GPTQ/FP8).',
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
            code: 'docker run --gpus all -p 8000:8000 \\\n  -v ~/.cache/huggingface:/root/.cache/huggingface \\\n  vllm/vllm-openai:latest \\\n  --model Qwen/Qwen2.5-7B-Instruct',
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
          code: 'vllm serve Qwen/Qwen2.5-7B-Instruct --port 8000',
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
          code: 'curl http://localhost:8000/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "model": "Qwen/Qwen2.5-7B-Instruct",\n    "messages": [{"role": "user", "content": "Hello from vLLM!"}]\n  }\'',
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
        { label: 'The server is up — wrap up', to: 'done' },
      ],
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
