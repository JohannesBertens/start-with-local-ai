export type OS = 'windows' | 'macos' | 'linux';
export type Level = 'beginner' | 'advanced';
export type Tool = 'ollama' | 'lmstudio' | 'llamacpp';

/** Facts accumulated about the user's chosen path. */
export interface AdventureFacts {
  reason?: string;
  level?: Level;
  os?: OS;
  tool?: Tool;
}

/** Structured content blocks rendered inside a node. */
export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'code'; code: string; lang?: string; caption?: string }
  | { type: 'callout'; tone?: 'info' | 'tip' | 'warning'; text: string }
  | { type: 'link'; href: string; label: string };

export type NodeId = string;

export interface Choice {
  label: string;
  to: NodeId;
  /** Facts recorded when this choice is taken (e.g. { os: 'linux' }). */
  sets?: Partial<AdventureFacts>;
  /** Optional helper text shown beneath the choice. */
  hint?: string;
}

export interface StoryNode {
  id: NodeId;
  title: string;
  body: ContentBlock[];
  /** Branch point: a set of choices. */
  choices?: Choice[];
  /** Linear continuation to the next node (tutorial steps). */
  next?: NodeId;
  /** Label for the linear "continue" button (defaults to "Continue"). */
  nextLabel?: string;
  /** Marks an end-of-path node. */
  terminal?: boolean;
}

export type Story = Record<NodeId, StoryNode>;

export const START_NODE: NodeId = 'intro';
