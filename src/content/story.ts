import type { Story } from './types';
import { buildStory } from './build';
import { validateStory } from './validate';

/**
 * The full story graph, generated from the catalog (src/content/catalog/) by the
 * builder. The UI, reducer, persistence, and validator all treat this as a plain
 * StoryNode map — adding a tool, OS, or hardware option is a pure data edit in
 * the catalog with no changes here.
 */
export const story: Story = buildStory();

// Fail loudly during development if the graph has broken links or dead ends.
if (import.meta.env?.DEV) {
  const result = validateStory(story);
  if (!result.ok) {
    console.error('Story graph validation failed:\n' + result.errors.join('\n'));
  }
}
