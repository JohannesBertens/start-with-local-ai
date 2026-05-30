import { describe, it, expect } from 'vitest';
import { validateStory } from '../content/validate';
import type { Story } from '../content/types';
import { story } from '../content/story';

describe('validateStory', () => {
  it('passes for the real story graph', () => {
    const result = validateStory(story);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('flags a choice pointing at a missing node', () => {
    const broken: Story = {
      intro: {
        id: 'intro',
        title: 'Intro',
        body: [],
        choices: [{ label: 'Nowhere', to: 'ghost' }],
      },
    };
    const result = validateStory(broken);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('ghost'))).toBe(true);
  });

  it('flags a non-terminal node with no way forward', () => {
    const broken: Story = {
      intro: { id: 'intro', title: 'Intro', body: [] },
    };
    const result = validateStory(broken);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('no next node or choices'))).toBe(true);
  });

  it('flags unreachable nodes', () => {
    const broken: Story = {
      intro: { id: 'intro', title: 'Intro', body: [], terminal: true },
      orphan: { id: 'orphan', title: 'Orphan', body: [], terminal: true },
    };
    const result = validateStory(broken);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('unreachable'))).toBe(true);
  });
});
