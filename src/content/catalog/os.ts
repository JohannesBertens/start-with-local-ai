import type { HardwareDef, RamTierDef, OSDef } from './types';

/**
 * Operating systems offered on the "which machine are you on?" step.
 * `hardware` lists the hardware profiles worth asking about for that OS; when
 * present the adventure inserts a hardware-selection step before tools.
 */
export const operatingSystems: OSDef[] = [
  {
    id: 'windows',
    label: 'Windows',
    hardware: ['nvidia-gpu', 'amd-gpu', 'amd-strix', 'cpu'],
    info: [
      {
        type: 'paragraph',
        text: 'Windows is the most common desktop OS and a perfectly good place to run local AI. Most beginner-friendly tools ship a native Windows installer, and NVIDIA GPUs are fully supported through CUDA drivers.',
      },
      {
        type: 'list',
        items: [
          'Best for: people who already live in Windows and want a one-click installer (Ollama, LM Studio) without touching a terminal.',
          'GPU acceleration: NVIDIA works out of the box; AMD now works via ROCm (RDNA3/4) or the universal Vulkan backend in llama.cpp.',
          'Heavy server engines: vLLM and SGLang are Linux-first — on Windows you would run them inside WSL2 or Docker rather than natively.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'WSL2 (Windows Subsystem for Linux) gives you a real Linux environment with GPU passthrough — handy if a tool is Linux-only but you prefer Windows.',
      },
    ],
  },
  {
    id: 'macos',
    label: 'macOS',
    hint: 'Apple Silicon (M-series) is especially well suited to local AI.',
    hardware: ['apple-silicon'],
    info: [
      {
        type: 'paragraph',
        text: 'macOS on Apple Silicon (M1–M4) is one of the best laptop experiences for local AI. The unified memory architecture lets the GPU use most of the system RAM, so a well-specced Mac can run surprisingly large models with excellent power efficiency.',
      },
      {
        type: 'list',
        items: [
          'Best for: Apple Silicon owners who want quiet, efficient, on-the-go inference.',
          'Acceleration: tools use the Metal/MLX backend; llama.cpp, Ollama, and LM Studio all run natively.',
          'Memory matters most: how large a model you can run is governed by your unified RAM (16 GB is entry-level, 32–64 GB+ is comfortable for bigger models).',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'Intel Macs work too but rely on CPU-only inference — expect it to be slower than Apple Silicon.',
      },
    ],
  },
  {
    id: 'linux',
    label: 'Linux',
    hardware: ['nvidia-gpu', 'amd-gpu', 'amd-strix', 'nvidia-spark', 'cpu'],
    info: [
      {
        type: 'paragraph',
        text: 'Linux is the native home of the local-AI ecosystem. It has the best driver support, the lowest overhead, and is what almost every tool is developed and tested against first — making it the top choice for serious or GPU-heavy setups.',
      },
      {
        type: 'list',
        items: [
          'Best for: maximum performance, multi-GPU rigs, and running server engines (vLLM, SGLang) the way they are designed to run.',
          'GPU support: first-class NVIDIA CUDA and AMD ROCm; the cleanest path for GPU passthrough into containers and VMs.',
          'Headless friendly: easy to run a tool as a background service and reach it from other machines on your network.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'If you want to follow upstream docs and community guides with the fewest surprises, Linux is usually the path of least resistance.',
      },
    ],
  },
  {
    id: 'docker',
    label: 'Docker',
    hint: 'Run tools in containers — handy for servers and reproducible setups.',
    info: [
      {
        type: 'paragraph',
        text: 'Docker packages a tool and all its dependencies into a container that runs the same way everywhere. Instead of installing onto your host OS, you pull an image and run it — ideal for servers, reproducible setups, and keeping your machine clean.',
      },
      {
        type: 'list',
        items: [
          'Best for: reproducible deployments, homelab servers, and trying a tool without installing it system-wide.',
          'GPU access: works best on a Linux host with the NVIDIA Container Toolkit (or ROCm for AMD); GPU passthrough is limited or unavailable on Docker Desktop for Mac.',
          'Official images: Ollama, vLLM, and SGLang all publish ready-to-run container images.',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'On Windows and macOS, Docker runs inside a lightweight VM, which adds some overhead — for top GPU performance a Linux host is best.',
      },
    ],
  },
];

/** Hardware profiles, keyed by id. Referenced from OSDef.hardware. */
export const hardwareProfiles: HardwareDef[] = [
  {
    id: 'nvidia-gpu',
    label: 'NVIDIA GPU (GeForce / RTX / data-center)',
    hint: 'CUDA — the broadest support. VRAM is what matters, and 16 GB is the 2026 minimum.',
    askRam: true,
    ramHint: '16',
    info: [
      {
        type: 'paragraph',
        text: 'NVIDIA is the most broadly supported hardware for local AI — every engine targets CUDA first. For LLM work, VRAM capacity matters far more than core count or clock speed: if the model does not fit, performance collapses to ~2 tok/s via CPU offload.',
      },
      {
        type: 'list',
        items: [
          'VRAM is everything: an 8B model needs ~6 GB at Q4; 32B needs ~20 GB; 70B needs ~43 GB. See the VRAM tier above for what fits your card.',
          'The used RTX 3090 (24 GB, ~$700) is the community value king — two of them run 70B models for half the cost of a single 5090.',
          'The RTX 5090 (32 GB GDDR7, ~$2,000) is the new performance leader with 1,792 GB/s bandwidth — 2.3× faster than a 4090 on 8B models.',
          '16 GB is the 2026 minimum for a daily-driver local LLM; 8 GB cards are severely limiting.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'A model has to fit in VRAM for full GPU speed. If it spills into system RAM, expect a sharp slowdown — pick a smaller or more heavily quantized model. Quantization (GGUF Q4_K_M) cuts memory use by ~4× with minimal quality loss.',
      },
    ],
  },
  {
    id: 'amd-gpu',
    label: 'AMD GPU (Radeon / Instinct)',
    hint: 'ROCm acceleration on supported cards.',
    askRam: true,
    ramHint: '16',
    info: [
      {
        type: 'paragraph',
        text: 'Modern AMD Radeon and Instinct cards accelerate local AI through ROCm, AMD\'s CUDA equivalent. Support has matured a lot: RDNA3 (RX 7000) and RDNA4 (RX 9000) are supported on both Linux and Windows, and llama.cpp\'s Vulkan backend runs on almost any recent Radeon as a universal fallback.',
      },
      {
        type: 'list',
        items: [
          'Best for: Radeon RX 7000/9000 or Instinct owners who want GPU acceleration without buying NVIDIA.',
          'Two paths: ROCm/HIP for best performance on supported cards, or the Vulkan backend (llama.cpp) which "just works" on new or unsupported GPUs.',
          'Check support: RDNA2/3/4 are covered; older GCN/Polaris cards (RX 5000 and earlier) generally fall back to Vulkan or CPU.',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'vLLM and SGLang offer ROCm builds, but NVIDIA remains the smoothest path for those server engines today.',
      },
    ],
  },
  {
    id: 'amd-strix',
    label: 'AMD Strix / Strix Halo (Ryzen AI APU)',
    hint: 'APUs with a large shared memory pool — no fixed VRAM.',
    askRam: true,
    ramHint: '32',
    info: [
      {
        type: 'paragraph',
        text: 'AMD Strix and Strix Halo (Ryzen AI / Ryzen AI Max) are APUs that fuse CPU, GPU, and an NPU with a large pool of unified memory shared between them. Strix Halo configurations with up to 128 GB of shared LPDDR5X can hold models that would never fit on a typical consumer discrete GPU.',
      },
      {
        type: 'list',
        items: [
          'Best for: thin laptops and mini-PCs that want to run mid-to-large models from a big shared memory pool.',
          'Unified memory: there is no fixed VRAM — you allocate a slice of system RAM to the GPU, so 64–128 GB configs can run 30B–70B-class models.',
          'Acceleration: ROCm support for the Ryzen AI APUs, with llama.cpp\'s Vulkan backend as a reliable alternative.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'Memory bandwidth, not capacity, is usually the bottleneck on these APUs — large models fit, but generation speed is more modest than a high-end discrete GPU.',
      },
    ],
  },
  {
    id: 'nvidia-spark',
    label: 'NVIDIA DGX Spark (GB10)',
    hint: 'ARM64 desktop AI box with 128 GB unified memory.',
    askRam: true,
    ramHint: '128',
    info: [
      {
        type: 'paragraph',
        text: 'The NVIDIA DGX Spark is a compact desktop "personal AI supercomputer" built on the GB10 Grace Blackwell superchip: an Arm CPU and Blackwell GPU sharing 128 GB of coherent unified memory. It runs DGX OS (Linux) with the full NVIDIA/CUDA software stack preinstalled.',
      },
      {
        type: 'list',
        items: [
          'Best for: developers and researchers who want to prototype, fine-tune, and serve large models locally on a quiet desktop box.',
          'Memory: 128 GB unified memory holds ~70B models at FP16 and much larger when quantized; two units can be linked for ~405B-class models.',
          'Software: CUDA-native, so vLLM, SGLang, Ollama, and llama.cpp all run — note it is ARM64, so use ARM/CUDA builds and containers.',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'Bandwidth (around 273 GB/s) is lower than a top discrete GPU, so the Spark excels at fitting big models rather than maximum tokens-per-second.',
      },
    ],
  },
  {
    id: 'apple-silicon',
    label: 'Apple Silicon (M-series)',
    hint: 'Unified memory — the GPU shares your system RAM.',
    askRam: true,
    ramHint: '16',
    info: [
      {
        type: 'paragraph',
        text: 'Apple Silicon (M1–M4) is one of the best laptop experiences for local AI. The unified memory architecture lets the GPU use most of the system RAM, so a well-specced Mac can run surprisingly large models with excellent power efficiency.',
      },
      {
        type: 'list',
        items: [
          'Best for: Apple Silicon owners who want quiet, efficient, on-the-go inference.',
          'Acceleration: tools use the Metal/MLX backend; llama.cpp, Ollama, and LM Studio all run natively.',
          'Memory matters most: how large a model you can run is governed by your unified RAM (16 GB is entry-level, 32–64 GB+ is comfortable for bigger models).',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'Find your total RAM in About This Mac → Memory. The GPU can use most of it for model inference.',
      },
    ],
  },
  {
    id: 'cpu',
    label: 'No dedicated GPU (CPU only)',
    hint: 'Works everywhere — just slower for large models.',
    askRam: true,
    ramHint: '16',
    info: [
      {
        type: 'paragraph',
        text: 'No dedicated GPU is completely fine for getting started — llama.cpp, Ollama, and LM Studio all run on CPU alone. It is the most universal path: it works on any machine, governed mainly by how much system RAM you have.',
      },
      {
        type: 'list',
        items: [
          'Best for: trying local AI on an existing laptop or desktop with no compatible GPU.',
          'Stick to smaller models: quantized 1B–8B models run at a usable pace; larger models work but feel slow.',
          'RAM is the limit: a model must fit in system RAM, so 16 GB+ is recommended for comfortable use.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'Use quantized GGUF models (e.g. Q4_K_M) to cut memory use and speed things up. You can always add a GPU later and switch backends.',
      },
    ],
  },
];

const hardwareById = new Map(hardwareProfiles.map((h) => [h.id, h]));

export function getHardware(id: string): HardwareDef | undefined {
  return hardwareById.get(id as HardwareDef['id']);
}

/**
 * RAM tier options shown on the "how much RAM?" step. Each tier is a discrete
 * radio-button choice with a label and an optional hint.
 */
export const ramTiers: RamTierDef[] = [
  {
    id: 8,
    label: '8 GB',
    hint: 'Entry-level; works for small models (1–3B) on CPU.',
    info: [
      {
        type: 'paragraph',
        text: '8 GB is enough to run small models on CPU, especially with 4-bit quantization. It is tight — you will be limited to 1B–3B-parameter models and generation will be slow for anything beyond Q2 quantization.',
      },
    ],
  },
  {
    id: 16,
    label: '16 GB',
    hint: 'Comfortable for CPU and Apple Silicon M1/M2.',
    info: [
      {
        type: 'paragraph',
        text: '16 GB is the sweet spot for most CPU-only and Apple Silicon M1/M2 users. You can run 3B–8B models comfortably, and Apple Silicon M3/M4 chips with 16 GB can still handle surprisingly large models thanks to unified memory efficiency.',
      },
    ],
  },
  {
    id: 24,
    label: '24 GB',
    hint: 'Apple Silicon M3 Pro — good balance of capacity.',
    info: [
      {
        type: 'paragraph',
        text: '24 GB is the standard Apple Silicon M3 Pro configuration. It opens up larger models than 16 GB and is a solid choice for anyone on the M3 Pro.',
      },
    ],
  },
  {
    id: 32,
    label: '32 GB',
    hint: 'Mid-to-large models; Strix Halo entry-level.',
    info: [
      {
        type: 'paragraph',
        text: '32 GB handles 7B–13B-parameter models comfortably and is the entry-level configuration for AMD Strix Halo APUs. On Apple Silicon it can run 13B–30B models with good efficiency.',
      },
    ],
  },
  {
    id: 48,
    label: '48 GB',
    hint: 'Apple Silicon M3 Max — room for 30B+ class models.',
    info: [
      {
        type: 'paragraph',
        text: '48 GB is the Apple Silicon M3 Max tier, opening the door to 30B–40B-class models and long context windows without swapping.',
      },
    ],
  },
  {
    id: 64,
    label: '64 GB',
    hint: 'Large models; Strix Halo — handles 30B+ class.',
    info: [
      {
        type: 'paragraph',
        text: '64 GB gives you plenty of headroom for 30B–70B-class models. It is a common Strix Halo configuration and the maximum unified memory on the M3 Max.',
      },
    ],
  },
  {
    id: 128,
    label: '128 GB',
    hint: 'Strix Halo max; DGX Spark — fits ~70B models.',
    info: [
      {
        type: 'paragraph',
        text: '128 GB is the top configuration for AMD Strix Halo and the standard DGX Spark capacity. It can hold ~70B-parameter models at FP16 and much larger ones with quantization.',
      },
    ],
  },
  {
    id: 256,
    label: '256 GB',
    hint: 'Workstation/unix — fits ~130B+ class models.',
    info: [
      {
        type: 'paragraph',
        text: '256 GB is for high-end workstations and servers. It opens the door to 130B+ class models and is rarely needed outside of serious fine-tuning or multi-modal workloads.',
      },
    ],
  },
];

const ramTierById = new Map(ramTiers.map((t) => [t.id, t]));
export function getRamTier(id: number): RamTierDef | undefined {
  return ramTierById.get(id);
}

/** VRAM tiers for discrete GPUs. Same IDs as ramTiers, but GPU-specific hints. */
export const vramTiers: RamTierDef[] = [
  {
    id: 8,
    label: '8 GB',
    hint: 'RTX 4060 / RX 7600 class — small quantized models only.',
    info: [
      {
        type: 'paragraph',
        text: '8 GB is enough to run 1B–3B-parameter models with heavy quantization (Q4 or lower). It is tight for anything serious — you will be limited to small chat models and tiny image generators.',
      },
    ],
  },
  {
    id: 12,
    label: '12 GB',
    hint: 'RTX 3060/4070/5070 class — entry-level for 7B–14B models.',
    info: [
      {
        type: 'paragraph',
        text: '12 GB is the most common VRAM tier on Steam — it handles 7B–14B models comfortably at Q4 and is a solid entry point. The RTX 3060 (12 GB), RTX 4070, and RTX 5070 all live here.',
      },
    ],
  },
  {
    id: 16,
    label: '16 GB',
    hint: 'RTX 4080/5080 class — comfortable for 7B–13B at higher quants.',
    info: [
      {
        type: 'paragraph',
        text: '16 GB handles 7B–13B-parameter models comfortably at Q4/Q5 and is the sweet spot for most mid-range consumer GPUs. The RTX 4080, RTX 5080, RTX 4070 Ti Super, and RX 9070 XT all live here.',
      },
    ],
  },
  {
    id: 24,
    label: '24 GB',
    hint: 'RTX 3090/4090 class — runs 30B+ models at Q4.',
    info: [
      {
        type: 'paragraph',
        text: '24 GB is the enthusiast sweet spot. It runs 27B–32B models at Q4 with room for context and is the most popular single-GPU choice for serious local LLM work. The RTX 3090 (~$700 used) and RTX 4090 (~$1,600) live here.',
      },
    ],
  },
  {
    id: 32,
    label: '32 GB',
    hint: 'RTX 5090 — flagship consumer card, 32B models with headroom.',
    info: [
      {
        type: 'paragraph',
        text: '32 GB is the RTX 5090 tier and the new consumer performance king with 1,792 GB/s GDDR7 bandwidth. It runs 32B models at Q4 with long context comfortably, and can squeeze 70B at Q3–Q4 with careful settings.',
      },
    ],
  },
  {
    id: 48,
    label: '48 GB',
    hint: 'Dual GPU (2× RTX 3090/4090) — runs 70B models at Q4.',
    info: [
      {
        type: 'paragraph',
        text: '48 GB is the dual-consumer-GPU tier — two RTX 3090s or 4090s in a single machine. This is the community favourite path to 70B-class models (Llama 3.3 70B fits at Q4) at a fraction of data-centre cost.',
      },
    ],
  },
  {
    id: 96,
    label: '96 GB',
    hint: 'RTX PRO 6000 / L40S — professional, 70B at FP16.',
    info: [
      {
        type: 'paragraph',
        text: '96 GB is the professional workstation tier (RTX PRO 6000, L40S). It can hold 70B models at FP16 and 120B+ MoE models at Q4. The go-to for a single-card setup when 24–48 GB is not enough.',
      },
    ],
  },
  {
    id: 256,
    label: '256 GB',
    hint: 'B200 / GB200 — extreme capacity.',
    info: [
      {
        type: 'paragraph',
        text: '256 GB is the B200 and GB200 NVL72 configuration. It is rarely needed — the only workloads that use it are multi-hundred-billion-parameter models with long context at full precision.',
      },
    ],
  },
];

const vramTierById = new Map(vramTiers.map((t) => [t.id, t]));
export function getVramTier(id: number): RamTierDef | undefined {
  return vramTierById.get(id);
}

/**
 * Tier options available per hardware type. Discrete GPUs use VRAM tiers; unified-memory
 * hardware (apple-silicon, amd-strix, cpu) uses RAM tiers; DGX Spark is excluded
 * because it is always 128 GB and has no RAM step.
 */
export const RAM_OPTIONS: Record<string, number[]> = {
  'apple-silicon': [16, 24, 32, 48, 64, 128],
  'amd-strix': [16, 32, 64, 128],
  cpu: [8, 16, 32, 64, 128, 256],
  'nvidia-gpu': [8, 12, 16, 24, 32, 48, 96],
  'amd-gpu': [8, 12, 16, 24, 32, 48, 96],
};

export function ramOptionsFor(hardware: string): RamTierDef[] {
  const tiers = RAM_OPTIONS[hardware] ?? [];
  if (hardware === 'nvidia-gpu' || hardware === 'amd-gpu') {
    return tiers.map((id) => getVramTier(id)).filter(Boolean) as RamTierDef[];
  }
  return tiers.map((id) => getRamTier(id)).filter(Boolean) as RamTierDef[];
}