import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NodeView } from '../components/NodeView';
import type { StoryNode } from '../content/types';

afterEach(cleanup);

const node: StoryNode = {
  id: 'choose-tool-macos',
  title: 'Pick your tool',
  body: [{ type: 'paragraph', text: 'Choose one.' }],
  choices: [
    {
      label: 'Ollama',
      to: 'ollama-macos-install',
      hint: 'Simplest start.',
      info: {
        title: 'Ollama — background',
        body: [{ type: 'paragraph', text: 'Ollama is an open-source runtime.' }],
      },
    },
    { label: 'No-info option', to: 'elsewhere' },
  ],
};

describe('NodeView info modal', () => {
  it('shows an (i) button only for choices that have info', () => {
    render(<NodeView node={node} onChoose={() => {}} onAdvance={() => {}} />);
    const infoButtons = screen.getAllByRole('button', { name: /More about/i });
    expect(infoButtons).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'More about Ollama' })).toBeInTheDocument();
  });

  it('opens a dialog with the background content when (i) is clicked', () => {
    render(<NodeView node={node} onChoose={() => {}} onAdvance={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'More about Ollama' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Ollama — background')).toBeInTheDocument();
    expect(screen.getByText('Ollama is an open-source runtime.')).toBeInTheDocument();
  });

  it('does not navigate when opening the info modal', () => {
    const onChoose = vi.fn();
    render(<NodeView node={node} onChoose={onChoose} onAdvance={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'More about Ollama' }));
    expect(onChoose).not.toHaveBeenCalled();
  });

  it('closes the dialog via the close button and Escape', () => {
    render(<NodeView node={node} onChoose={() => {}} onAdvance={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'More about Ollama' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    // Re-open, then close with Escape.
    fireEvent.click(screen.getByRole('button', { name: 'More about Ollama' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('still navigates when the choice itself is clicked', () => {
    const onChoose = vi.fn();
    render(<NodeView node={node} onChoose={onChoose} onAdvance={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Ollama Simplest start/i }));
    expect(onChoose).toHaveBeenCalledTimes(1);
  });
});
