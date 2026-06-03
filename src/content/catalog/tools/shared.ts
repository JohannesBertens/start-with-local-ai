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

/** Per-VRAM-tier NVIDIA GPU callout, so the advice matches the user's chosen tier. */
function nvidiaGpuNote(ramGb?: number): ContentBlock {
  const tip = (() => {
    switch (ramGb) {
      case 8:
        return 'NVIDIA GPU with 8 GB VRAM: install the proprietary driver for CUDA acceleration. You are limited to small quantized models — Qwen 3.5 9B at Q4 is your best option. Expect to run 1B–9B class models only.';
      case 12:
        return 'NVIDIA GPU with 12 GB VRAM — install the proprietary driver for CUDA. Handles 7B–14B models at Q4. The most common Steam tier (RTX 3060/4070/5070).';
      case 16:
        return 'NVIDIA GPU with 16 GB VRAM — install the proprietary driver for CUDA. Sweet spot for mid-range GPUs (RTX 4080/5080). Runs Qwen 3.6 27B at Q4 with short context, or Qwen 3.5 35B-A3B MoE at ~100 tok/s with RAM offload.';
      case 24:
        return 'NVIDIA GPU with 24 GB VRAM (e.g. RTX 3090/4090) — install the proprietary driver for CUDA. The enthusiast sweet spot: Qwen 3.6 27B at Q5, Qwen 3.5 32B at Q4, or 35B-A3B MoE at ~140 tok/s.';
      case 32:
        return 'NVIDIA GPU with 32 GB VRAM (RTX 5090) — install the proprietary driver for CUDA. The new consumer flagship with 1,792 GB/s GDDR7. Runs Qwen 3.6 27B at Q8 (near-lossless) or Qwen 3.5 72B at IQ2 for the first time on a single consumer card.';
      case 48:
        return 'Dual NVIDIA GPUs with 48 GB total VRAM — install the proprietary driver for CUDA. The community path to 70B models: Qwen 3.5 72B at Q4 via --tensor-split on two used 3090s (~$1,400).';
      case 96:
        return 'NVIDIA GPU with 96 GB VRAM (RTX PRO 6000 / L40S) — install the proprietary driver for CUDA. Professional tier: runs Qwen 3.5 72B at full FP16, Qwen 3.5 122B-A10B MoE at IQ4, or Step 3.7 Flash (198B MoE) via CPU offload.';
      default:
        return 'NVIDIA GPU path: install the proprietary driver so CUDA acceleration kicks in automatically. For LLMs, VRAM determines what fits — the community workhorse is a used 24 GB RTX 3090 (~$700); the new performance king is the 32 GB RTX 5090 (~$2,000) at 1,792 GB/s.';
    }
  })();
  return { type: 'callout', tone: 'tip', text: tip };
}

/**
 * A reusable callout that tailors GPU-acceleration advice to the chosen
 * hardware and VRAM. Tools that auto-detect the GPU (Ollama, llama.cpp) share this.
 */
export function gpuNote(hw?: Hardware, ramGb?: number): ContentBlock {
  switch (hw) {
    case 'nvidia-gpu':
      return nvidiaGpuNote(ramGb);
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
