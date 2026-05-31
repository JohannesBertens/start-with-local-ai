import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Breadcrumb } from '../components/Breadcrumb';
import type { TrailItem } from '../state/useAdventure';
import type { Choice } from '../content/types';

afterEach(cleanup);

const privacy: Choice = {
  label: 'Privacy',
  to: 'choose-level',
  sets: { reason: 'privacy' },
};
const cost: Choice = {
  label: 'Cost',
  to: 'choose-level',
  sets: { reason: 'cost' },
};

function makeTrail(): TrailItem[] {
  return [
    { id: 'intro', index: 0, title: 'Welcome, traveler', active: false, branches: [] },
    {
      id: 'why-local',
      index: 1,
      title: 'Why local, not the cloud?',
      active: false,
      branches: [
        { label: 'Privacy', to: 'choose-level', taken: true, choice: privacy },
        { label: 'Cost', to: 'choose-level', taken: false, choice: cost },
      ],
    },
    { id: 'choose-level', index: 2, title: 'How deep do you want to go?', active: true, branches: [] },
  ];
}

describe('Breadcrumb', () => {
  it('renders nothing for a trail of one node', () => {
    const { container } = render(
      <Breadcrumb
        trail={[{ id: 'intro', index: 0, title: 'Welcome', active: true, branches: [] }]}
        onJump={() => {}}
        onExplore={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('is collapsed by default showing root, ellipsis and current', () => {
    render(<Breadcrumb trail={makeTrail()} onJump={() => {}} onExplore={() => {}} />);
    const toggle = screen.getByRole('button', { expanded: false });
    expect(toggle).toHaveTextContent('Welcome, traveler');
    expect(toggle).toHaveTextContent('How deep do you want to go?');
    expect(toggle).toHaveTextContent('…');
    // Intermediate node titles are hidden until expanded.
    expect(screen.queryByText('Why local, not the cloud?')).toBeNull();
  });

  it('expands to reveal the full DAG with all visited nodes', () => {
    render(<Breadcrumb trail={makeTrail()} onJump={() => {}} onExplore={() => {}} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    expect(screen.getByRole('button', { name: /Hide path/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Welcome, traveler' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Why local, not the cloud?' })).toBeInTheDocument();
  });

  it('marks the taken branch and offers untaken branches as explore buttons', () => {
    render(<Breadcrumb trail={makeTrail()} onJump={() => {}} onExplore={() => {}} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // The taken "Privacy" branch is not a button (non-interactive marker).
    expect(
      screen.queryByRole('button', { name: /Privacy/i }),
    ).toBeNull();
    // The untaken "Cost" branch is an explore button.
    expect(
      screen.getByRole('button', { name: /Cost.*explore this path instead/i }),
    ).toBeInTheDocument();
  });

  it('calls onJump with the node index when a node is clicked', () => {
    const onJump = vi.fn();
    render(<Breadcrumb trail={makeTrail()} onJump={onJump} onExplore={() => {}} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    fireEvent.click(screen.getByRole('button', { name: 'Why local, not the cloud?' }));
    expect(onJump).toHaveBeenCalledWith(1);
  });

  it('calls onExplore with the branch index and untaken choice, then collapses', () => {
    const onExplore = vi.fn();
    render(<Breadcrumb trail={makeTrail()} onJump={() => {}} onExplore={onExplore} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    fireEvent.click(
      screen.getByRole('button', { name: /Cost.*explore this path instead/i }),
    );
    expect(onExplore).toHaveBeenCalledTimes(1);
    expect(onExplore).toHaveBeenCalledWith(1, cost);

    // Collapses back to the summary afterwards.
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  });

  it('marks the active node with aria-current', () => {
    render(<Breadcrumb trail={makeTrail()} onJump={() => {}} onExplore={() => {}} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    const active = screen.getByRole('button', { name: 'How deep do you want to go?' });
    expect(active).toHaveAttribute('aria-current', 'step');
    const inactive = screen.getByRole('button', { name: 'Welcome, traveler' });
    expect(inactive).not.toHaveAttribute('aria-current');
  });
});
