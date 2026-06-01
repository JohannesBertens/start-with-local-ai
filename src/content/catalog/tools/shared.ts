import type { ContentBlock, Hardware, OS } from '../../types';
import type { PathContext } from '../types';

/** Tools that run as GPU inference servers (vLLM, SGLang). */
export const GPU_HARDWARE: Hardware[] = ['nvidia-gpu', 'amd-gpu', 'nvidia-spark'];

/** A short, human-readable description of the chosen hardware. */
export function hardwareLabel(hw?: Hardware): string {
  switch (hw) {
    case 'nvidia-gpu':
      return 'an NVIDIA GPU';
    case 'amd-gpu':
      return 'an AMD GPU';
    case 'amd-strix':
      return 'an AMD Strix / Strix Halo APU';
    case 'nvidia-spark':
      return 'an NVIDIA DGX Spark';
    case 'apple-silicon':
      return 'Apple Silicon (M-series)';
    case 'cpu':
      return 'a CPU-only machine';
    default:
      return 'your machine';
  }
}

/**
 * A reusable callout that tailors GPU-acceleration advice to the chosen
 * hardware. Tools that auto-detect the GPU (Ollama, llama.cpp) share this.
 */
export function gpuNote(hw?: Hardware): ContentBlock {
  switch (hw) {
    case 'nvidia-gpu':
      return {
        type: 'callout',
        tone: 'tip',
        text: 'NVIDIA GPU detected path: install the proprietary driver and the CUDA toolkit so CUDA acceleration kicks in automatically.',
      };
    case 'amd-gpu':
      return {
        type: 'callout',
        tone: 'tip',
        text: 'AMD GPU: install a recent ROCm stack. Check that your card is on the ROCm support list; otherwise it falls back to CPU.',
      };
    case 'amd-strix':
      return {
        type: 'callout',
        tone: 'info',
        text: 'Strix / Strix Halo shares system RAM with the GPU. Raise the iGPU/VRAM (UMA) allocation in the BIOS and keep plenty of RAM free for larger models.',
      };
    case 'nvidia-spark':
      return {
        type: 'callout',
        tone: 'info',
        text: 'DGX Spark is ARM64 with a large unified memory pool — use the ARM64/sbsa CUDA builds, and you can load much bigger models than a typical desktop GPU.',
      };
    case 'cpu':
      return {
        type: 'callout',
        tone: 'info',
        text: 'No GPU is fine — models run on the CPU, just slower. Stick to smaller (1B–8B) models and 4-bit quantizations for a snappy experience.',
      };
    default:
      return {
        type: 'callout',
        tone: 'info',
        text: 'A discrete GPU speeds things up a lot, but is not required — everything also runs on the CPU.',
      };
  }
}

/** Convenience: does this context target a Linux-like server (linux/docker)? */
export function isServerOS(os: OS): boolean {
  return os === 'linux' || os === 'docker';
}

export function ctxKey(ctx: PathContext): string {
  const base = ctx.hardware
    ? ctx.ramGb
      ? `${ctx.os}-${ctx.hardware}-${ctx.ramGb}`
      : `${ctx.os}-${ctx.hardware}`
    : ctx.os;
  return `${ctx.useCase}-${base}`;
}

/**
 * A reusable callout for image/video generation tools, tailoring VRAM advice to
 * the chosen hardware. Image and video models are far more GPU-hungry than chat.
 */
export function imageGpuNote(hw?: Hardware): ContentBlock {
  switch (hw) {
    case 'nvidia-gpu':
      return {
        type: 'callout',
        tone: 'tip',
        text: 'NVIDIA is the smoothest path for image/video. ~6–8 GB VRAM handles SD 1.5/SDXL; 12–16 GB+ is comfortable for FLUX and short video. Install a recent driver so CUDA is detected.',
      };
    case 'amd-gpu':
      return {
        type: 'callout',
        tone: 'info',
        text: 'AMD works via ROCm (Linux, supported RDNA cards) or DirectML/Zluda on Windows — expect a little more setup than NVIDIA. 8 GB+ VRAM recommended.',
      };
    case 'amd-strix':
      return {
        type: 'callout',
        tone: 'info',
        text: 'Strix / Strix Halo shares system RAM with the iGPU. Raise the VRAM (UMA) allocation in the BIOS; generation runs but is slower than a discrete GPU.',
      };
    case 'nvidia-spark':
      return {
        type: 'callout',
        tone: 'info',
        text: 'DGX Spark is ARM64 with a large unified memory pool — use ARM64/CUDA builds. Plenty of memory for big models, though bandwidth caps raw speed.',
      };
    case 'cpu':
      return {
        type: 'callout',
        tone: 'warning',
        text: 'CPU-only image generation works but is very slow (minutes per image). Expect to wait, and prefer smaller models like SD 1.5 over SDXL/FLUX.',
      };
    default:
      return {
        type: 'callout',
        tone: 'info',
        text: 'Image and video models lean heavily on the GPU. A discrete GPU with plenty of VRAM makes the biggest difference to speed and which models you can run.',
      };
  }
}
