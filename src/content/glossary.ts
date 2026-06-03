/**
 * Glossary of local AI terms, extracted from the adventure content.
 *
 * Fill strategy: one-time scan of all catalog and fixed content, then
 * manually curated going forward. Add new entries as the project grows.
 *
 * Each term links to relevant story node ids so a future enhancement can
 * offer "see this in context" navigation.
 */

export interface GlossaryEntry {
  /** Canonical term — lowercase, hyphenated slug used as the id/anchors. */
  term: string;
  /** Display label (capitalised / spaced naturally). */
  label: string;
  /** Concise definition, ≤2 sentences where possible. */
  definition: string;
  /** Optional list of story node ids where this term appears. */
  appearsIn?: string[];
  /** Optional longer explanation for the expanded view. */
  detail?: string;
  /** Optional list of related term slugs. */
  seeAlso?: string[];
}

export const glossary: Record<string, GlossaryEntry> = {
  quantization: {
    term: 'quantization',
    label: 'Quantization',
    definition:
      'Reducing the numerical precision of a model\'s weights to save memory and speed up inference, with a small trade-off in quality.',
    detail:
      'Models are normally stored at 16-bit (FP16) or 32-bit (FP32) precision. Quantization rounds each weight to fewer bits — common levels are Q2, Q3, Q4, Q5, Q6, and Q8 (where Q4 means ~4 bits per weight). The GGUF format (used by llama.cpp and Ollama) packages quantized models. A Q4_K_M (4-bit K-quant, medium) cuts memory usage by ~4× versus FP16 with minimal quality loss, making a 70B model fit on a 24 GB GPU instead of needing ~140 GB.',
    appearsIn: ['why-local', 'nvidia-gpu-os-node', 'cpu-hw-node'],
    seeAlso: ['gguf', 'fp16'],
  },
  gguf: {
    term: 'gguf',
    label: 'GGUF',
    definition:
      'A file format for quantized LLM weights pioneered by llama.cpp; the standard way to distribute small, efficient model files for local inference.',
    appearsIn: ['ollama-advanced'],
    seeAlso: ['quantization', 'llamacpp'],
  },
  fp16: {
    term: 'fp16',
    label: 'FP16 / half-precision',
    definition:
      'A 16-bit floating-point number format commonly used to store model weights, balancing precision and memory usage.',
    detail:
      'FP16 (also called half-precision) uses 16 bits per weight — half the memory of FP32 (full-precision, 32 bits). Most open models ship in FP16 by default. Quantization (Q4, Q8) goes further by using even fewer bits.',
    appearsIn: ['nvidia-gpu-os-node'],
    seeAlso: ['quantization'],
  },
  vram: {
    term: 'vram',
    label: 'VRAM',
    definition:
      'Video RAM — the dedicated memory on a graphics card (GPU) that holds model weights and context during inference.',
    detail:
      'VRAM capacity determines how large a model a GPU can run at full speed. If a model\'s weights (plus the KV cache for context) fit in VRAM, inference runs at GPU speed. If they spill into system RAM, performance drops sharply as data shuttles across the PCIe bus. Consumer GPUs range from 8 GB (RTX 4060) to 32 GB (RTX 5090); professional cards go higher.',
    appearsIn: [
      'choose-ram-nvidia',
      'choose-ram-amd',
      'choose-hw-chat-nvidia-gpu',
    ],
    seeAlso: ['ram', 'kv-cache'],
  },
  ram: {
    term: 'ram',
    label: 'System RAM',
    definition:
      'Your computer\'s main memory (as opposed to GPU VRAM). Used to store the model when a GPU is unavailable, or as overflow when VRAM is insufficient.',
    appearsIn: ['choose-ram-apple-silicon', 'choose-ram-cpu', 'choose-ram-strix'],
    seeAlso: ['vram'],
  },
  'kv-cache': {
    term: 'kv-cache',
    label: 'KV Cache',
    definition:
      'A memory structure that stores computed key-value attention pairs for previous tokens, avoiding recomputation during generation. Grows with context length.',
    detail:
      'During autoregressive generation, every new token attends to all previous tokens. The KV cache stores those attention key-value pairs so each new step does not re-process the entire sequence. Longer context windows consume more KV cache memory — about 2 bytes × layers × hidden_size × context_length per token. PagedAttention (used by vLLM) manages the KV cache in small pages to reduce fragmentation.',
    appearsIn: ['vllm-install', 'vllm-serve', 'vllm-advanced'],
    seeAlso: ['vram', 'context-length'],
  },
  'context-length': {
    term: 'context-length',
    label: 'Context length / window',
    definition:
      'The maximum number of tokens a model can process in a single request — the sum of your prompt and the generated response.',
    detail:
      'A model\'s context window is the total sequence length it was trained on. Longer context lets it handle large documents, long conversations, or code files in one pass. Common lengths: 8K–32K for older models, 128K–256K for modern ones. Longer contexts consume more KV cache memory (see KV cache). You can cap context length via --max-model-len to fit larger models into limited VRAM.',
    appearsIn: ['ollama-usage', 'vllm-serve', 'sglang-serve'],
    seeAlso: ['kv-cache', 'tokens'],
  },
  tokens: {
    term: 'tokens',
    label: 'Tokens',
    definition:
      'The atomic units a language model reads and writes — roughly ¾ of a word in English, or a few characters in code. Models price memory and speed in tokens.',
    appearsIn: ['ollama-firstrun', 'why-local'],
    seeAlso: ['context-length'],
  },
  'ggml': {
    term: 'ggml',
    label: 'GGML',
    definition:
      'The tensor library underlying llama.cpp and the precursor to the GGUF format. Handles CPU and GPU inference with support for quantization.',
    seeAlso: ['gguf', 'llamacpp'],
  },
  llamacpp: {
    term: 'llamacpp',
    label: 'llama.cpp',
    definition:
      'An open-source C/C++ inference engine that runs quantized models efficiently on CPU and GPU. The foundation of many local AI tools.',
    detail:
      'llama.cpp is the most widely used lower-level engine in the local AI ecosystem. It introduced the GGUF format and pioneered CPU-optimized inference with GPU offload. Most user-facing tools (Ollama, LM Studio, Jan, GPT4All) bundle llama.cpp under the hood. It also ships a standalone server binary with an OpenAI-compatible HTTP API.',
    appearsIn: ['choose-tool-ollama-install'],
    seeAlso: ['gguf', 'quantization'],
  },
  'paged-attention': {
    term: 'paged-attention',
    label: 'PagedAttention',
    definition:
      'vLLM\'s memory management technique that stores KV cache in non-contiguous, page-sized blocks to reduce fragmentation and increase throughput.',
    detail:
      'Traditional KV cache allocates contiguous memory for each request\'s entire context, wasting space due to fragmentation and over-provisioning. PagedAttention, inspired by OS virtual memory, manages the KV cache in fixed-size pages. This cuts memory waste to a few percent and enables features like copy-on-write (shared prefix across requests). It is the primary reason vLLM achieves high throughput under concurrent load.',
    appearsIn: ['vllm-install', 'vllm-advanced'],
    seeAlso: ['kv-cache', 'vllm'],
  },
  'continuous-batching': {
    term: 'continuous-batching',
    label: 'Continuous batching',
    definition:
      'A serving technique where new requests join the running batch as soon as others finish, keeping the GPU fully utilised and maximising throughput.',
    appearsIn: ['vllm-use', 'vllm-advanced'],
    seeAlso: ['vllm', 'throughput'],
  },
  'speculative-decoding': {
    term: 'speculative-decoding',
    label: 'Speculative decoding',
    definition:
      'A technique where a smaller "draft" model generates candidate tokens that a larger target model verifies in parallel, speeding up generation without quality loss.',
    appearsIn: ['vllm-install', 'vllm-mtp'],
    seeAlso: ['throughput', 'mtp'],
  },
  throughput: {
    term: 'throughput',
    label: 'Throughput',
    definition:
      'The number of tokens a model generates per second across all concurrent requests; the key metric for production serving.',
    appearsIn: ['vllm-use', 'vllm-advanced'],
  },
  'tensor-parallelism': {
    term: 'tensor-parallelism',
    label: 'Tensor parallelism',
    definition:
      'Splitting a model\'s weight matrices across multiple GPUs so they cooperate on each forward pass, allowing a single large model to run on several cards.',
    appearsIn: ['vllm-advanced'],
    seeAlso: ['vram'],
  },
  'openai-compatible': {
    term: 'openai-compatible',
    label: 'OpenAI-compatible API',
    definition:
      'A local HTTP endpoint that mimics the OpenAI API shape (/v1/chat/completions), so any OpenAI SDK or client works by changing only the base URL.',
    appearsIn: [
      'ollama-advanced',
      'vllm-use',
      'sglang-use',
      'tabby-install',
    ],
  },
  rocm: {
    term: 'rocm',
    label: 'ROCm',
    definition:
      'AMD\'s open-source GPU compute platform, analogous to NVIDIA\'s CUDA. Required for GPU acceleration on AMD Radeon and Instinct cards.',
    appearsIn: [
      'choose-hw-chat-amd-gpu',
      'vllm-install-linux',
      'ollama-install-linux',
    ],
    seeAlso: ['cuda'],
  },
  cuda: {
    term: 'cuda',
    label: 'CUDA',
    definition:
      'NVIDIA\'s parallel computing platform and programming model. The most widely supported GPU acceleration layer for local AI tools.',
    appearsIn: [
      'choose-hw-chat-nvidia-gpu',
      'vllm-install-linux',
      'ollama-install-linux',
    ],
    seeAlso: ['rocm'],
  },
  metal: {
    term: 'metal',
    label: 'Metal (Apple GPU)',
    definition:
      'Apple\'s low-level GPU framework used by local AI tools (llama.cpp, Ollama) for GPU acceleration on Apple Silicon Macs.',
    appearsIn: ['choose-os-macos', 'ollama-install-macos'],
    seeAlso: ['apple-silicon'],
  },
  'apple-silicon': {
    term: 'apple-silicon',
    label: 'Apple Silicon',
    definition:
      'Apple\'s line of ARM-based processors (M1–M4) with unified memory that the GPU shares with the CPU — excellent for local AI because most RAM can hold model weights.',
    appearsIn: ['choose-os-macos', 'choose-hw-macos-apple-silicon'],
    seeAlso: ['metal', 'unified-memory'],
  },
  'unified-memory': {
    term: 'unified-memory',
    label: 'Unified memory',
    definition:
      'A memory architecture where the CPU and GPU share the same pool of RAM. Apple Silicon, AMD Strix Halo, and the DGX Spark use this — the model has access to much more memory than a discrete GPU\'s VRAM.',
    appearsIn: [
      'choose-hw-macos-apple-silicon',
      'choose-hw-linux-amd-strix',
      'choose-hw-linux-nvidia-spark',
    ],
    seeAlso: ['apple-silicon', 'vram'],
  },
  'nvidia-container-toolkit': {
    term: 'nvidia-container-toolkit',
    label: 'NVIDIA Container Toolkit',
    definition:
      'A tool that makes NVIDIA GPUs available inside Docker containers, required by GPU-accelerated container images (Ollama, vLLM, SGLang).',
    appearsIn: ['ollama-install-docker', 'vllm-install-docker', 'sglang-install-docker'],
    seeAlso: ['docker', 'cuda'],
  },
  docker: {
    term: 'docker',
    label: 'Docker',
    definition:
      'A container runtime that packages software with its dependencies into isolated, reproducible environments. Many local AI tools publish official Docker images.',
    appearsIn: ['choose-os-docker'],
    seeAlso: ['nvidia-container-toolkit'],
  },
  'hugging-face': {
    term: 'hugging-face',
    label: 'Hugging Face',
    definition:
      'A platform and community for hosting, sharing, and discovering open-source models and datasets. Most open models are published here.',
    appearsIn: ['vllm-install', 'vllm-serve', 'comfyui-getmodel'],
  },
  'stable-diffusion': {
    term: 'stable-diffusion',
    label: 'Stable Diffusion',
    definition:
      'A family of open-source text-to-image generative models. The foundation of most local image generation tools like AUTOMATIC1111, ComfyUI, and Fooocus.',
    appearsIn: [
      'choose-tool-image-video',
      'comfyui-generate',
      'automatic1111-generate',
    ],
    seeAlso: ['flux'],
  },
  flux: {
    term: 'flux',
    label: 'FLUX',
    definition:
      'A modern text-to-image model family by Black Forest Labs, known for high-quality output and good prompt adherence. Available in Pro, Dev, and Schnell variants.',
    appearsIn: ['comfyui-generate', 'fooocus-install'],
    seeAlso: ['stable-diffusion'],
  },
  'controlnet': {
    term: 'controlnet',
    label: 'ControlNet',
    definition:
      'A neural network that guides image generation using reference images — pose skeletons, depth maps, edge detection, or scribbles — for precise spatial control.',
    appearsIn: ['comfyui-advanced'],
    seeAlso: ['stable-diffusion', 'lora'],
  },
  lora: {
    term: 'lora',
    label: 'LoRA (Low-Rank Adaptation)',
    definition:
      'A lightweight fine-tuning technique that trains a small set of adapter weights rather than the full model. LoRAs are shared as small files (~10–100 MB) that can be swapped without changing the base model.',
    appearsIn: ['comfyui-advanced'],
    seeAlso: ['controlnet', 'stable-diffusion'],
  },
  'quantization-aware-training': {
    term: 'quantization-aware-training',
    label: 'Quantization-Aware Training (QAT)',
    definition:
      'A training technique that simulates quantization during training so the model learns to maintain accuracy at lower precision, producing better quantized models than post-training quantization alone.',
    seeAlso: ['quantization'],
  },
  moe: {
    term: 'moe',
    label: 'Mixture of Experts (MoE)',
    definition:
      'A model architecture that activates only a subset of its parameters ("experts") per token, achieving much higher total parameter counts while keeping inference costs low.',
    detail:
      'MoE models have many "expert" sub-networks but only route each token to a small subset. For example, Qwen 3.5 35B-A3B has 35B total parameters but only 3.6B active per token — offering 35B-model quality at the speed of a 3.6B model. MoE models are denoted as "total-active" (e.g., 35B-A3B). Common in frontier models (DeepSeek V3, Mixtral, Qwen MoE).',
    appearsIn: ['vram-tiers-24', 'vram-tiers-16'],
    seeAlso: ['quantization', 'throughput'],
  },
  'gguf-split': {
    term: 'gguf-split',
    label: 'GGUF Split / Multi-GPU',
    definition:
      'Splitting a GGUF model across multiple GPUs (e.g. --tensor-split in llama.cpp) so two or more cards can collaboratively run a model too large for one.',
    appearsIn: ['vram-tiers-48'],
    seeAlso: ['tensor-parallelism', 'gguf'],
  },
  'modelfile': {
    term: 'modelfile',
    label: 'Modelfile (Ollama)',
    definition:
      'A configuration file for Ollama that lets you customise a model with a system prompt, custom parameters (temperature, context length), and a base model.',
    appearsIn: ['ollama-advanced'],
    seeAlso: ['ollama'],
  },
  'vulkan': {
    term: 'vulkan',
    label: 'Vulkan',
    definition:
      'A cross-platform GPU API that llama.cpp uses as a universal backend — works on NVIDIA, AMD, Intel, and Apple GPUs without vendor-specific drivers.',
    appearsIn: ['choose-hw-linux-amd-gpu'],
    seeAlso: ['cuda', 'rocm', 'llamacpp'],
  },
  mtp: {
    term: 'mtp',
    label: 'Multi-Token Prediction (MTP)',
    definition:
      'A technique where a model predicts several future tokens at once instead of one at a time, used both as a training signal and for speculative decoding to speed up inference.',
    detail:
      'MTP extends the standard next-token prediction training objective by adding small extra prediction heads (MTP modules) that forecast tokens at offsets t+2, t+3 and beyond — not just the immediate next token. This gives each position more to learn and encourages the hidden state to carry information useful beyond the next word.\n\nDuring inference, MTP modules can be reused as a built-in draft path for speculative decoding. The draft head proposes several continuation tokens, and the main model verifies them all in a single parallel forward pass. If the main model accepts the draft, you get multiple tokens for roughly the cost of one — up to 3× speedup in practice with no quality loss. This is distinct from requiring a separate external draft model.\n\nNotable uses: DeepSeek V3 uses MTP-1 (one extra token during training and inference); Step 3.5 Flash uses MTP-3; Gemma 4 ships dedicated MTP drafters delivering up to 3× speedup on the 26B and 31B models. vLLM supports MTP natively via --speculative-config method=mtp.',
    appearsIn: ['vllm-mtp', 'vram-tiers-24', 'vram-tiers-48', 'vram-tiers-96'],
    seeAlso: ['speculative-decoding', 'throughput', 'kv-cache'],
  },
  'gguf-parallel': {
    term: 'gguf-parallel',
    label: 'CPU + GPU offloading',
    definition:
      'Running a model partly on GPU and partly on CPU when it does not fully fit in VRAM — the GPU handles as many layers as fit and the CPU handles the rest, traded off against slower generation.',
    appearsIn: ['vram-tiers-16'],
    seeAlso: ['vram', 'ram'],
  },
};
