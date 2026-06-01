import { describe, it, expect } from 'vitest';
import { story } from '../content/story';
import { buildStory, CHOOSE_USECASE_ID } from '../content/build';
import { validateStory } from '../content/validate';
import {
  enumerateContexts,
  operatingSystems,
  selectableHardwareFor,
  toolsFor,
  getOS,
  useCases,
} from '../content/catalog';
import type { StoryNode } from '../content/types';

describe('catalog + builder', () => {
  it('produces a valid graph (no dead ends, broken links, or orphans)', () => {
    expect(validateStory(buildStory())).toEqual({ ok: true, errors: [] });
  });

  it('starts from the fixed intro -> why-local -> choose-usecase', () => {
    expect(story.intro.next).toBe('why-local');
    expect(story['why-local'].choices?.every((c) => c.to === CHOOSE_USECASE_ID)).toBe(true);
  });

  it('offers the three use cases, each routing into its own OS-selection node', () => {
    const choices = story[CHOOSE_USECASE_ID].choices ?? [];
    const labels = choices.map((c) => c.label);
    expect(labels).toEqual(useCases.map((u) => u.label));
    for (const uc of useCases) {
      const choice = choices.find((c) => c.sets?.useCase === uc.id);
      expect(choice?.to).toBe(`choose-os-${uc.id}`);
      expect(story[`choose-os-${uc.id}`]).toBeDefined();
    }
  });

  it('offers reachable OSes per use case (chat reaches docker, image-video does not)', () => {
    const chatOs = story['choose-os-chat'].choices?.map((c) => c.label) ?? [];
    expect(chatOs).toContain('Docker');
    const imageOs = story['choose-os-image-video'].choices?.map((c) => c.label) ?? [];
    expect(imageOs).not.toContain('Docker');
    expect(imageOs).toContain('Windows');
  });

  it('routes Windows/Linux through a hardware step; macOS through Apple Silicon; Docker straight to tools', () => {
    const target = (osId: string) =>
      story['choose-os-chat'].choices?.find((c) => c.label === getOS(osId as never)?.label)?.to;

    expect(target('windows')).toBe('choose-hw-chat-windows');
    expect(target('linux')).toBe('choose-hw-chat-linux');
    // macOS now has apple-silicon as its hardware option — goes through the hw step.
    expect(target('macos')).toBe('choose-hw-chat-macos');
    // Docker has no hardware field — routes directly to tool selection.
    expect(target('docker')).toBe('choose-tool-chat-docker');
  });

  it('clears downstream facts when an upstream choice is made', () => {
    const ucChoice = story[CHOOSE_USECASE_ID].choices?.[0];
    expect(ucChoice?.sets).toMatchObject({ os: undefined, hardware: undefined, tool: undefined });

    const osChoice = story['choose-os-chat'].choices?.[0];
    expect(osChoice?.sets).toMatchObject({ hardware: undefined, tool: undefined });

    const hwChoice = story['choose-hw-chat-linux'].choices?.[0];
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
    for (const uc of useCases) {
      for (const os of operatingSystems) {
        for (const hw of selectableHardwareFor(uc.id, os)) {
          expect(toolsFor({ useCase: uc.id, os: os.id, hardware: hw.id }).length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('curates the top-5 tools per use case (no overflowing tool lists)', () => {
    const inUseCase = (uc: string) => tools_of(uc);
    function tools_of(uc: string): string[] {
      const ids = new Set<string>();
      for (const ctx of enumerateContexts()) {
        if (ctx.useCase !== uc) continue;
        for (const t of toolsFor(ctx)) ids.add(t.id);
      }
      return [...ids];
    }
    expect(inUseCase('chat').sort()).toEqual(
      ['gpt4all', 'jan', 'llamacpp', 'lmstudio', 'ollama'].sort(),
    );
    expect(inUseCase('coding').sort()).toEqual(
      ['llamacpp', 'ollama', 'sglang', 'tabby', 'vllm'].sort(),
    );
    expect(inUseCase('image-video').sort()).toEqual(
      ['a1111', 'comfyui', 'fooocus', 'invokeai', 'sdnext'].sort(),
    );
    // Any single tool-selection node offers at most five options.
    const toolNodes = Object.values(story).filter((n) => n.id.startsWith('choose-tool-'));
    for (const node of toolNodes) {
      expect(node.choices?.length ?? 0).toBeLessThanOrEqual(5);
    }
  });

  it('restricts vLLM/SGLang to the coding use case on Linux GPUs and Docker', () => {
    for (const ctx of enumerateContexts()) {
      const ids = toolsFor(ctx).map((t) => t.id);
      if (ctx.os === 'windows' || ctx.os === 'macos') {
        expect(ids).not.toContain('vllm');
        expect(ids).not.toContain('sglang');
      }
      // Server engines never appear outside the coding use case.
      if (ctx.useCase !== 'coding') {
        expect(ids).not.toContain('vllm');
        expect(ids).not.toContain('sglang');
      }
    }
    const linuxNvidia = toolsFor({ useCase: 'coding', os: 'linux', hardware: 'nvidia-gpu' }).map((t) => t.id);
    expect(linuxNvidia).toEqual(expect.arrayContaining(['vllm', 'sglang']));
    const linuxAmd = toolsFor({ useCase: 'coding', os: 'linux', hardware: 'amd-gpu' }).map((t) => t.id);
    expect(linuxAmd).toContain('vllm');
    expect(linuxAmd).not.toContain('sglang');
    const docker = toolsFor({ useCase: 'coding', os: 'docker' }).map((t) => t.id);
    expect(docker).toEqual(expect.arrayContaining(['vllm', 'sglang']));
  });

  it('attaches background info to every user selection choice', () => {
    // Every choice on a decision node (why-local, choose-usecase,
    // choose-os-*, choose-hw-*, choose-tool-*) should expose a researched (i) modal.
    const selectionNodeIds = ['why-local', CHOOSE_USECASE_ID];
    const isSelectionNode = (n: StoryNode) =>
      selectionNodeIds.includes(n.id) ||
      n.id.startsWith('choose-os-') ||
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

  it('loops terminal "done" steps back to the use-case-selection node', () => {
    const doneNodes = Object.values(story).filter(
      (n: StoryNode) => n.terminal && n.id.endsWith('-done'),
    );
    expect(doneNodes.length).toBeGreaterThan(0);
    for (const node of doneNodes) {
      expect(node.choices?.some((c) => c.to === CHOOSE_USECASE_ID)).toBe(true);
    }
  });
});
