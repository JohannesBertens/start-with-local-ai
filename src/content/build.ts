import type { Choice, NodeId, Story, StoryNode } from './types';
import {
  enumerateContexts,
  hardwareFor,
  operatingSystems,
  selectableHardwareFor,
  toolsFor,
  type OSDef,
  type PathContext,
  type ToolDef,
} from './catalog';
import { EXPLORE_TARGET } from './catalog/types';
import { ctxKey } from './catalog/tools/shared';
import { fixedNodes } from './fixed';

/** The OS-selection node id; also the target of "explore another path". */
export const CHOOSE_OS_ID: NodeId = 'choose-os';

const chooseHwId = (os: string): NodeId => `choose-hw-${os}`;
const chooseToolId = (ctx: PathContext): NodeId => `choose-tool-${ctxKey(ctx)}`;
const installId = (tool: ToolDef, ctx: PathContext): NodeId =>
  `${tool.id}-${ctxKey(ctx)}-install`;
const stepId = (tool: ToolDef, slug: string): NodeId => `${tool.id}-${slug}`;

/** Does choosing this OS lead anywhere (a hardware step or a tool step)? */
function osIsReachable(os: OSDef): boolean {
  return hardwareFor(os).length > 0
    ? selectableHardwareFor(os).length > 0
    : toolsFor({ os: os.id }).length > 0;
}

/** Where an OS choice routes: its hardware step, or straight to tool selection. */
function osTarget(os: OSDef): NodeId {
  return hardwareFor(os).length > 0 ? chooseHwId(os.id) : chooseToolId({ os: os.id });
}

function buildChooseOS(): StoryNode {
  const choices: Choice[] = operatingSystems
    .filter(osIsReachable)
    .map((os) => ({
      label: os.label,
      hint: os.hint,
      to: osTarget(os),
      // Choosing an OS invalidates any downstream hardware/tool selection.
      sets: { os: os.id, hardware: undefined, tool: undefined },
      info: { title: `${os.label} — background`, body: os.info },
    }));

  return {
    id: CHOOSE_OS_ID,
    title: 'Which machine are you on?',
    body: [
      {
        type: 'paragraph',
        text: 'Installation differs by operating system. Pick yours and we will route the rest of the adventure accordingly.',
      },
    ],
    choices,
  };
}

function buildChooseHardware(os: OSDef): StoryNode {
  const choices: Choice[] = selectableHardwareFor(os).map((hw) => ({
    label: hw.label,
    hint: hw.hint,
    to: chooseToolId({ os: os.id, hardware: hw.id }),
    // Choosing hardware invalidates any previously selected tool.
    sets: { hardware: hw.id, tool: undefined },
    info: { title: `${hw.label} — background`, body: hw.info },
  }));

  return {
    id: chooseHwId(os.id),
    title: `What are you running on? (${os.label})`,
    body: [
      {
        type: 'paragraph',
        text: 'Your hardware decides which acceleration to set up and which tools make sense. Pick the closest match.',
      },
    ],
    choices,
  };
}

function buildChooseTool(ctx: PathContext): StoryNode {
  const supported = toolsFor(ctx);
  const choices: Choice[] = supported.map((tool) => ({
    label: tool.label,
    hint: tool.summary,
    to: installId(tool, ctx),
    sets: { tool: tool.id },
    info: { title: `${tool.label} — background`, body: tool.info },
  }));

  return {
    id: chooseToolId(ctx),
    title: 'Pick your tool',
    body: [
      {
        type: 'paragraph',
        text: 'These are the tools that fit your setup. Unsure? The first option is usually the smoothest place to start.',
      },
    ],
    choices,
  };
}

function buildInstallNode(tool: ToolDef, ctx: PathContext): StoryNode {
  const { title, body } = tool.install(ctx);
  const firstStep = tool.steps[0];
  return {
    id: installId(tool, ctx),
    title,
    body,
    next: firstStep ? stepId(tool, firstStep.slug) : undefined,
    terminal: firstStep ? undefined : true,
  };
}

/** Build a tool's shared follow-up step nodes (generated once per tool). */
function buildToolSteps(tool: ToolDef): StoryNode[] {
  return tool.steps.map((step) => {
    const choices: Choice[] | undefined = step.choices?.map((c) => ({
      label: c.label,
      hint: c.hint,
      to: c.to === EXPLORE_TARGET ? CHOOSE_OS_ID : stepId(tool, c.to),
    }));

    return {
      id: stepId(tool, step.slug),
      title: step.title,
      body: step.body,
      next: step.nextSlug ? stepId(tool, step.nextSlug) : undefined,
      nextLabel: step.nextLabel,
      choices,
      terminal: step.terminal,
    };
  });
}

/**
 * Assembles the full story graph from the catalog. The result is a plain
 * StoryNode map — identical in shape to the hand-written graph the engine and
 * validator already understand.
 */
export function buildStory(): Story {
  const story: Story = { ...fixedNodes };

  const add = (node: StoryNode) => {
    story[node.id] = node;
  };

  add(buildChooseOS());

  // Hardware-selection steps (only for OSes that ask about hardware).
  for (const os of operatingSystems) {
    if (hardwareFor(os).length > 0 && selectableHardwareFor(os).length > 0) {
      add(buildChooseHardware(os));
    }
  }

  // Tool-selection steps, one per selectable context.
  for (const ctx of enumerateContexts()) {
    add(buildChooseTool(ctx));
  }

  // Install nodes, one per (tool, context).
  for (const ctx of enumerateContexts()) {
    for (const tool of toolsFor(ctx)) {
      add(buildInstallNode(tool, ctx));
    }
  }

  // Shared follow-up steps, generated once per tool.
  const seenTools = new Set<string>();
  for (const ctx of enumerateContexts()) {
    for (const tool of toolsFor(ctx)) {
      if (seenTools.has(tool.id)) continue;
      seenTools.add(tool.id);
      for (const node of buildToolSteps(tool)) add(node);
    }
  }

  return story;
}
