import type { Story } from './types';
import { coreNodes } from './intro';
import { ollamaNodes } from './ollama';
import { lmStudioNodes } from './lmstudio';
import { llamaCppNodes } from './llamacpp';
import { validateStory } from './validate';

export const story: Story = {
  ...coreNodes,
  ...ollamaNodes,
  ...lmStudioNodes,
  ...llamaCppNodes,
};

// Fail loudly during development if the graph has broken links or dead ends.
if (import.meta.env?.DEV) {
  const result = validateStory(story);
  if (!result.ok) {
    console.error('Story graph validation failed:\n' + result.errors.join('\n'));
  }
}
