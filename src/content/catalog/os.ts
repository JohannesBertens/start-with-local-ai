import type { HardwareDef, OSDef } from './types';

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
    hint: 'CUDA acceleration — the most broadly supported path.',
    info: [
      {
        type: 'paragraph',
        text: 'NVIDIA GPUs are the best-supported hardware for local AI. CUDA is the de-facto standard that nearly every engine targets first, so you get the widest tool support and the most reliable performance — from GeForce/RTX cards (including the RTX 50-series "Blackwell") to data-center cards.',
      },
      {
        type: 'list',
        items: [
          'Best for: the broadest compatibility — every tool here, including vLLM and SGLang, runs well on NVIDIA.',
          'VRAM is the limit: ~8 GB runs small quantized models, 12–16 GB is comfortable, and 24 GB+ opens up larger models and longer context.',
          'Setup: install a recent NVIDIA driver; most tools bundle the CUDA runtime so you rarely install it separately.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'A model has to fit in VRAM for full GPU speed. If it spills into system RAM, expect a sharp slowdown — pick a smaller or more heavily quantized model.',
      },
    ],
  },
  {
    id: 'amd-gpu',
    label: 'AMD GPU (Radeon / Instinct)',
    hint: 'ROCm acceleration on supported cards.',
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
    hint: 'Unified-memory APUs that share system RAM with the GPU.',
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
    hint: 'ARM64 desktop AI box with a large unified memory pool.',
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
    id: 'cpu',
    label: 'No dedicated GPU (CPU only)',
    hint: 'Works everywhere — just slower for large models.',
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
