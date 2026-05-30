import type { NodeId, Story } from './types';
import { START_NODE } from './types';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/**
 * Validates the story graph:
 *  - every `next`/`choice.to` target exists
 *  - non-terminal nodes offer a way forward (next or choices)
 *  - every node is reachable from START_NODE
 */
export function validateStory(story: Story): ValidationResult {
  const errors: string[] = [];
  const ids = new Set(Object.keys(story));

  for (const node of Object.values(story)) {
    if (node.next && !ids.has(node.next)) {
      errors.push(`Node "${node.id}" has next "${node.next}" which does not exist.`);
    }
    for (const choice of node.choices ?? []) {
      if (!ids.has(choice.to)) {
        errors.push(
          `Node "${node.id}" has a choice to "${choice.to}" which does not exist.`,
        );
      }
    }
    const hasForward =
      Boolean(node.next) || (node.choices?.length ?? 0) > 0;
    if (!node.terminal && !hasForward) {
      errors.push(
        `Node "${node.id}" is not terminal but has no next node or choices.`,
      );
    }
  }

  if (!ids.has(START_NODE)) {
    errors.push(`Start node "${START_NODE}" is missing from the story.`);
    return { ok: false, errors };
  }

  // Reachability from the start node.
  const reachable = new Set<NodeId>();
  const queue: NodeId[] = [START_NODE];
  while (queue.length > 0) {
    const id = queue.shift() as NodeId;
    if (reachable.has(id) || !ids.has(id)) continue;
    reachable.add(id);
    const node = story[id];
    if (node.next) queue.push(node.next);
    for (const choice of node.choices ?? []) queue.push(choice.to);
  }

  for (const id of ids) {
    if (!reachable.has(id)) {
      errors.push(`Node "${id}" is unreachable from "${START_NODE}".`);
    }
  }

  return { ok: errors.length === 0, errors };
}
