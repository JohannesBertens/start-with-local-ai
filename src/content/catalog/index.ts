import type { Hardware, OS } from '../types';
import { operatingSystems, hardwareProfiles, getHardware } from './os';
import type { HardwareDef, OSDef, PathContext, ToolDef } from './types';
import { ollama } from './tools/ollama';
import { lmstudio } from './tools/lmstudio';
import { llamacpp } from './tools/llamacpp';
import { vllm } from './tools/vllm';
import { sglang } from './tools/sglang';

/** All tools in display order. Add a tool by appending its ToolDef here. */
export const tools: ToolDef[] = [ollama, lmstudio, llamacpp, vllm, sglang];

export { operatingSystems, hardwareProfiles, getHardware };
export type { HardwareDef, OSDef, PathContext, ToolDef };

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

/** Tools supported in a given context, in catalog order. */
export function toolsFor(ctx: PathContext): ToolDef[] {
  return tools.filter((t) => t.supports(ctx));
}

/**
 * Enumerate every *selectable* leaf context (the contexts a user can actually
 * reach after picking an OS and, where applicable, hardware). Contexts with no
 * supported tools are excluded so the builder never produces a dead-end
 * selection step. Centralising this keeps the builder and its tests in sync.
 */
export function enumerateContexts(): PathContext[] {
  const contexts: PathContext[] = [];
  for (const os of operatingSystems) {
    const hardware = hardwareFor(os);
    if (hardware.length > 0) {
      for (const hw of hardware) {
        const ctx: PathContext = { os: os.id, hardware: hw.id };
        if (toolsFor(ctx).length > 0) contexts.push(ctx);
      }
    } else {
      const ctx: PathContext = { os: os.id };
      if (toolsFor(ctx).length > 0) contexts.push(ctx);
    }
  }
  return contexts;
}

/** Hardware options for an OS that lead to at least one supported tool. */
export function selectableHardwareFor(os: OSDef): HardwareDef[] {
  return hardwareFor(os).filter((hw) => toolsFor({ os: os.id, hardware: hw.id }).length > 0);
}

export type { Hardware, OS };
