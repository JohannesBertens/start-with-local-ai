import type { ToolDef } from '../types';
import { EXPLORE_TARGET } from '../types';

export const sglang: ToolDef = {
  id: 'sglang',
  label: 'SGLang',
  summary: 'Fast serving runtime with structured-output superpowers.',
  info: [
    {
      type: 'paragraph',
      text: 'SGLang ("Structured Generation Language") is an open-source (Apache 2.0) serving runtime tuned for agentic and structured workloads. Its RadixAttention stores the KV cache in a radix tree keyed by token prefixes, so shared prefixes across requests are reused automatically — a big win for multi-turn chat, RAG, and tool-using agents.',
    },
    {
      type: 'list',
      items: [
        'Best for: agent chains, RAG, and anything that reuses large shared prompt prefixes or needs fast constrained output.',
        'Key features: RadixAttention prefix caching, continuous batching, speculative decoding, and best-in-class grammar-constrained JSON/regex generation.',
        'Hardware: optimized primarily for NVIDIA GPUs, with AMD GPU support; it does not target TPUs/Trainium/Gaudi.',
        'API: serves an OpenAI-compatible endpoint (default port 30000).',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      text: 'Runs natively on Linux NVIDIA GPUs or via the official Docker image. On prefix-heavy workloads it can outperform other engines thanks to automatic cache reuse.',
    },
  ],
  // NVIDIA-focused GPU server: native on Linux NVIDIA, or via Docker.
  supports: (ctx) => {
    if (ctx.os === 'docker') return true;
    if (ctx.os === 'linux') return ctx.hardware === 'nvidia-gpu' || ctx.hardware === 'nvidia-spark';
    return false;
  },
  install: (ctx) => {
    if (ctx.os === 'docker') {
      return {
        title: 'Run SGLang in Docker',
        body: [
          {
            type: 'paragraph',
            text: 'The official image launches the OpenAI-compatible server. Install the NVIDIA Container Toolkit on the host, then:',
          },
          {
            type: 'code',
            lang: 'bash',
            code: 'docker run --gpus all -p 30000:30000 \\\n  -v ~/.cache/huggingface:/root/.cache/huggingface \\\n  lmsysorg/sglang:latest \\\n  python -m sglang.launch_server \\\n    --model-path Qwen/Qwen3.6-27B \\\n    --host 0.0.0.0 --port 30000',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Mounting the Hugging Face cache avoids re-downloading weights on each run.',
          },
        ],
      };
    }
    return {
      title: 'Install SGLang on Linux',
      body: [
        {
          type: 'paragraph',
          text: 'SGLang installs from PyPI. Use an isolated environment and the [all] extra to pull in the serving dependencies:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'uv venv --python 3.12 && source .venv/bin/activate\nuv pip install "sglang[all]"',
        },
        {
          type: 'callout',
          tone: ctx.hardware === 'nvidia-spark' ? 'info' : 'tip',
          text:
            ctx.hardware === 'nvidia-spark'
              ? 'On DGX Spark (ARM64/GB10), use CUDA builds for aarch64; the large unified memory suits big models well.'
              : 'SGLang targets NVIDIA GPUs with CUDA. Make sure a recent driver and CUDA toolkit are installed.',
        },
      ],
    };
  },
  steps: [
    {
      slug: 'serve',
      title: 'Launch the server',
      body: [
        {
          type: 'paragraph',
          text: 'Start the SGLang server, pointing it at a Hugging Face model id:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'python -m sglang.launch_server \\\n  --model-path Qwen/Qwen3.6-27B \\\n  --port 30000',
        },
        {
          type: 'paragraph',
          text: 'After the weights download, an OpenAI-compatible API is live on http://localhost:30000/v1.',
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
          text: 'Use any OpenAI-compatible client against the local endpoint:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'curl http://localhost:30000/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "model": "Qwen/Qwen3.6-27B",\n    "messages": [{"role": "user", "content": "Hello from SGLang!"}]\n  }\'',
        },
        {
          type: 'callout',
          tone: 'info',
          text: "SGLang's RadixAttention reuses shared prefixes across requests, which is a big win for agents, few-shot prompts, and structured generation.",
        },
      ],
      choices: [
        {
          label: 'Go deeper — structured output & tuning',
          to: 'advanced',
          hint: 'Constrained JSON, parallelism, and throughput options.',
        },
        { label: 'The server is up — wrap up', to: 'done' },
      ],
    },
    {
      slug: 'advanced',
      title: 'Advanced: structured output & performance',
      body: [
        {
          type: 'paragraph',
          text: 'SGLang can constrain generation to a JSON schema or regex, so model output is always parseable:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'curl http://localhost:30000/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "model": "Qwen/Qwen3.6-27B",\n    "messages": [{"role": "user", "content": "Give me a user as JSON"}],\n    "response_format": {"type": "json_object"}\n  }\'',
        },
        {
          type: 'list',
          items: [
            '--tp <n>: tensor-parallel across n GPUs for large models.',
            '--mem-fraction-static <f>: share of VRAM reserved for weights + KV cache.',
            '--context-length <n>: cap context to fit more concurrent requests.',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          text: 'Binding to 0.0.0.0 exposes the server to your network. Keep it local or behind an authenticated proxy.',
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
          text: 'You have a fast, structured-output-capable inference server on your own GPU. Next steps:',
        },
        {
          type: 'list',
          items: [
            'Point your OpenAI SDK at the local base URL and start building.',
            'Use constrained JSON output to wire the model into tools and agents reliably.',
            'Reuse shared prompt prefixes to benefit from RadixAttention caching.',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'Curious how the friendlier desktop tools compare? Explore another path below — your progress stays saved.',
        },
      ],
      terminal: true,
      choices: [{ label: 'Explore another tool or operating system', to: EXPLORE_TARGET }],
    },
  ],
};
