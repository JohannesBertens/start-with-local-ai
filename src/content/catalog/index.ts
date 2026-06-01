import type { Hardware, OS, UseCase } from '../types';
import { operatingSystems, hardwareProfiles, getHardware } from './os';
import { useCases, getUseCase } from './usecases';
import type {
  HardwareDef,
  OSDef,
  PathContext,
  ToolDef,
  UseCaseDef,
} from './types';
import { ollama } from './tools/ollama';
import { lmstudio } from './tools/lmstudio';
import { llamacpp } from './tools/llamacpp';
import { vllm } from './tools/vllm';
import { sglang } from './tools/sglang';
import { jan } from './tools/jan';
import { gpt4all } from './tools/gpt4all';
import { tabby } from './tools/tabby';
import { comfyui } from './tools/comfyui';
import { a1111 } from './tools/a1111';
import { fooocus } from './tools/fooocus';
import { invokeai } from './tools/invokeai';
import { sdnext } from './tools/sdnext';

/**
 * All tools in display order. Within a use case the order here is the order the
 * tools are offered (roughly "most used" first). Add a tool by appending its
 * ToolDef and tagging it with the use cases it serves.
 */
export const tools: ToolDef[] = [
  // Chat-first runners (some also serve the coding/inference path).
  ollama,
  lmstudio,
  llamacpp,
  jan,
  gpt4all,
  // Coding / inference servers.
  vllm,
  sglang,
  tabby,
  // Image & video generation.
  comfyui,
  a1111,
  fooocus,
  invokeai,
  sdnext,
];

export { operatingSystems, hardwareProfiles, getHardware, useCases, getUseCase };
export type { HardwareDef, OSDef, PathContext, ToolDef, UseCaseDef };

/** The OS def for an id, if any. */
export function getOS(id: OS): OSDef | undefined {
  return operatingSystems.find((o) => o.id === id);
}

/** Hardware options worth offering for an OS (its declared list, in order). */
export function hardwareFor(os: OSDef): HardwareDef[] {
  return (os.hardware ?? [])
    .map((id) => getHardware(id))
    .filter((h): h is HardwareDef => Boolean(h));
}

/** Tools supported in a given context (use case + OS + hardware), in catalog order. */
export function toolsFor(ctx: PathContext): ToolDef[] {
  return tools.filter((t) => t.useCases.includes(ctx.useCase) && t.supports(ctx));
}

/**
 * Enumerate every *selectable* leaf context (the contexts a user can actually
 * reach after picking a use case, an OS and, where applicable, hardware).
 * Contexts with no supported tools are excluded so the builder never produces a
 * dead-end selection step. Centralising this keeps the builder and its tests in
 * sync.
 */
export function enumerateContexts(): PathContext[] {
  const contexts: PathContext[] = [];
  for (const useCase of useCases) {
    for (const os of operatingSystems) {
      const hardware = hardwareFor(os);
      if (hardware.length > 0) {
        for (const hw of hardware) {
          const ctx: PathContext = { useCase: useCase.id, os: os.id, hardware: hw.id };
          if (toolsFor(ctx).length > 0) contexts.push(ctx);
        }
      } else {
        const ctx: PathContext = { useCase: useCase.id, os: os.id };
        if (toolsFor(ctx).length > 0) contexts.push(ctx);
      }
    }
  }
  return contexts;
}

/** Hardware options for a (use case, OS) that lead to at least one supported tool. */
export function selectableHardwareFor(useCase: UseCase, os: OSDef): HardwareDef[] {
  return hardwareFor(os).filter(
    (hw) => toolsFor({ useCase, os: os.id, hardware: hw.id }).length > 0,
  );
}

export type { Hardware, OS, UseCase };
