import { describe, it, expect } from 'vitest';
import { story } from '../content/story';
import { buildStory, CHOOSE_OS_ID } from '../content/build';
import { validateStory } from '../content/validate';
import {
  enumerateContexts,
  operatingSystems,
  selectableHardwareFor,
  toolsFor,
  getOS,
} from '../content/catalog';
import type { StoryNode } from '../content/types';

describe('catalog + builder', () => {
  it('produces a valid graph (no dead ends, broken links, or orphans)', () => {
    expect(validateStory(buildStory())).toEqual({ ok: true, errors: [] });
  });

  it('starts from the fixed intro -> why-local -> choose-level -> choose-os', () => {
    expect(story.intro.next).toBe('why-local');
    expect(story['why-local'].choices?.every((c) => c.to === 'choose-level')).toBe(true);
    expect(story['choose-level'].choices?.every((c) => c.to === CHOOSE_OS_ID)).toBe(true);
  });

  it('offers every reachable OS on the choose-os node, including docker', () => {
    const labels = story[CHOOSE_OS_ID].choices?.map((c) => c.label) ?? [];
    expect(labels).toEqual(operatingSystems.map((o) => o.label));
    expect(labels).toContain('Docker');
  });

  it('routes Windows/Linux through a hardware step but macOS/Docker straight to tools', () => {
    const target = (osId: string) =>
      story[CHOOSE_OS_ID].choices?.find((c) => c.label === getOS(osId as never)?.label)?.to;

    expect(target('windows')).toBe('choose-hw-windows');
    expect(target('linux')).toBe('choose-hw-linux');
    expect(target('macos')).toBe('choose-tool-macos');
    expect(target('docker')).toBe('choose-tool-docker');
  });

  it('clears downstream facts when an upstream choice is made', () => {
    const osChoice = story[CHOOSE_OS_ID].choices?.[0];
    expect(osChoice?.sets).toMatchObject({ hardware: undefined, tool: undefined });

    const hwChoice = story['choose-hw-linux'].choices?.[0];
    expect(hwChoice?.sets).toMatchObject({ tool: undefined });
  });

  it('every selectable context exposes at least one tool', () => {
    const contexts = enumerateContexts();
    expect(contexts.length).toBeGreaterThan(0);
    for (const ctx of contexts) {
      expect(toolsFor(ctx).length).toBeGreaterThan(0);
    }
  });

  it('only offers hardware options that lead to a supported tool', () => {
    for (const os of operatingSystems) {
      for (const hw of selectableHardwareFor(os)) {
        expect(toolsFor({ os: os.id, hardware: hw.id }).length).toBeGreaterThan(0);
      }
    }
  });

  it('restricts vLLM/SGLang to Linux GPUs and Docker', () => {
    // Not available on Windows or macOS.
    for (const ctx of enumerateContexts()) {
      const ids = toolsFor(ctx).map((t) => t.id);
      if (ctx.os === 'windows' || ctx.os === 'macos') {
        expect(ids).not.toContain('vllm');
        expect(ids).not.toContain('sglang');
      }
    }
    // Available on Linux + NVIDIA GPU.
    const linuxNvidia = toolsFor({ os: 'linux', hardware: 'nvidia-gpu' }).map((t) => t.id);
    expect(linuxNvidia).toEqual(expect.arrayContaining(['vllm', 'sglang']));
    // SGLang is NVIDIA-only: not offered for a plain AMD GPU.
    const linuxAmd = toolsFor({ os: 'linux', hardware: 'amd-gpu' }).map((t) => t.id);
    expect(linuxAmd).toContain('vllm');
    expect(linuxAmd).not.toContain('sglang');
    // Both available via Docker.
    const docker = toolsFor({ os: 'docker' }).map((t) => t.id);
    expect(docker).toEqual(expect.arrayContaining(['vllm', 'sglang']));
  });

  it('attaches background info to every user selection choice', () => {
    // Every choice on a decision node (why-local, choose-level, choose-os,
    // choose-hw-*, choose-tool-*) should expose a researched (i) modal.
    const selectionNodeIds = ['why-local', 'choose-level', CHOOSE_OS_ID];
    const isSelectionNode = (n: StoryNode) =>
      selectionNodeIds.includes(n.id) ||
      n.id.startsWith('choose-hw-') ||
      n.id.startsWith('choose-tool-');

    const selectionNodes = Object.values(story).filter(isSelectionNode);
    expect(selectionNodes.length).toBeGreaterThan(0);
    for (const node of selectionNodes) {
      expect(node.choices?.length ?? 0).toBeGreaterThan(0);
      for (const choice of node.choices ?? []) {
        expect(choice.info, `${node.id} -> "${choice.label}" missing info`).toBeDefined();
        expect((choice.info?.title.length ?? 0)).toBeGreaterThan(0);
        expect((choice.info?.body.length ?? 0)).toBeGreaterThan(0);
      }
    }
  });

  it('wires every install node to an existing first step', () => {
    const installNodes = Object.values(story).filter((n) => n.id.endsWith('-install'));
    expect(installNodes.length).toBeGreaterThan(0);
    for (const node of installNodes) {
      expect(node.next).toBeTruthy();
      expect(story[node.next as string]).toBeDefined();
    }
  });

  it('loops terminal "done" steps back to the OS-selection node', () => {
    const doneNodes = Object.values(story).filter(
      (n: StoryNode) => n.terminal && n.id.endsWith('-done'),
    );
    expect(doneNodes.length).toBeGreaterThan(0);
    for (const node of doneNodes) {
      expect(node.choices?.some((c) => c.to === CHOOSE_OS_ID)).toBe(true);
    }
  });
});
