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
  return ctx.hardware ? `${ctx.os}-${ctx.hardware}` : ctx.os;
}
