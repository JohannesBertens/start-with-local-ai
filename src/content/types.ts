export type OS = 'windows' | 'macos' | 'linux' | 'docker';
/** What the user wants to do locally — picked before the platform (OS). */
export type UseCase = 'chat' | 'image-video' | 'coding';
export type Tool =
  | 'ollama'
  | 'lmstudio'
  | 'llamacpp'
  | 'vllm'
  | 'sglang'
  | 'jan'
  | 'gpt4all'
  | 'tabby'
  | 'comfyui'
  | 'a1111'
  | 'fooocus'
  | 'invokeai'
  | 'sdnext';
export type Hardware =
  | 'nvidia-gpu'
  | 'amd-gpu'
  | 'amd-strix'
  | 'nvidia-spark'
  | 'cpu';

/** Facts accumulated about the user's chosen path. */
export interface AdventureFacts {
  reason?: string;
  useCase?: UseCase;
  os?: OS;
  hardware?: Hardware;
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

/** Extra background shown in a modal when a choice's (i) button is clicked. */
export interface ChoiceInfo {
  title: string;
  body: ContentBlock[];
}

export interface Choice {
  label: string;
  to: NodeId;
  /** Facts recorded when this choice is taken (e.g. { os: 'linux' }). */
  sets?: Partial<AdventureFacts>;
  /** Optional helper text shown beneath the choice. */
  hint?: string;
  /** Optional richer detail revealed via an (i) button in a modal. */
  info?: ChoiceInfo;
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
