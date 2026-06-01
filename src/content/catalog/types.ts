import type { ContentBlock, Hardware, NodeId, OS, Tool, UseCase } from '../types';

/**
 * The catalog describes the tutorial purely as *information*: which use cases,
 * operating systems, hardware profiles, and tools exist, and what content to
 * show for a given combination. The graph `builder` turns this data into the
 * StoryNode graph the UI renders, so adding a tool / OS / hardware / use case is
 * a data edit with no changes to presentation or navigation logic.
 */

/**
 * A resolved selection context: what the user wants to do (use case), the OS,
 * and (optionally) the chosen hardware.
 */
export interface PathContext {
  useCase: UseCase;
  os: OS;
  hardware?: Hardware;
}

/** A use-case option shown on the "what do you want to do?" step. */
export interface UseCaseDef {
  id: UseCase;
  label: string;
  hint?: string;
  /**
   * Richer background about the use case, revealed in a modal from the
   * use-case-selection step's (i) button. Kept here (data) so the UI stays
   * generic.
   */
  info: ContentBlock[];
}

/** An operating-system option shown on the "which machine are you on?" step. */
export interface OSDef {
  id: OS;
  label: string;
  hint?: string;
  /**
   * Richer background about the OS, revealed in a modal from the OS-selection
   * step's (i) button. Kept here (data) so the UI stays generic.
   */
  info: ContentBlock[];
  /**
   * Hardware profiles that make sense for this OS, in display order. When
   * present and non-empty, the user is asked to pick hardware before tools so
   * that hardware-specific guidance can be shown. Omit (or leave empty) to skip
   * the hardware step entirely (e.g. macOS, Docker).
   */
  hardware?: Hardware[];
}

/** A hardware profile shown on the "what are you running on?" step. */
export interface HardwareDef {
  id: Hardware;
  label: string;
  hint?: string;
  /**
   * Richer background about the hardware profile, revealed in a modal from the
   * hardware-selection step's (i) button.
   */
  info: ContentBlock[];
}

/** A shared tutorial step that follows installation (first run, usage, ...). */
export interface TutorialStep {
  /** Stable slug; the node id becomes `{tool}-{slug}`. */
  slug: string;
  title: string;
  body: ContentBlock[];
  /** Linear continuation (slug of the next step). */
  nextSlug?: string;
  /** Label for the linear "continue" button. */
  nextLabel?: string;
  /** Branch point instead of a linear `nextSlug`. */
  choices?: TutorialChoice[];
  /** Marks an end-of-path node. */
  terminal?: boolean;
}

/** A choice inside a tutorial step. `to` is a step slug, or one of the
 *  reserved navigation targets handled by the builder. */
export interface TutorialChoice {
  label: string;
  /** A sibling step slug, or a reserved target (see EXPLORE_TARGET). */
  to: string;
  hint?: string;
}

/** Reserved `to` target: route back to the OS-selection step to explore more. */
export const EXPLORE_TARGET = '@explore';

export interface ToolDef {
  id: Tool;
  label: string;
  /** Use cases this tool serves; it is only offered on those paths. */
  useCases: UseCase[];
  /** One-line summary used as the hint on the tool-selection step. */
  summary: string;
  /**
   * Richer background about the tool, revealed in a modal from the tool-selection
   * step's (i) button. Kept here (data) so the UI stays generic.
   */
  info: ContentBlock[];
  /** Returns true if this tool can be installed in the given context. */
  supports: (ctx: PathContext) => boolean;
  /** Installation content for the given context (the install node body). */
  install: (ctx: PathContext) => InstallContent;
  /** Shared post-install steps (first run, usage, advanced, done, ...). */
  steps: TutorialStep[];
}

/** The install node's title + body for a context. */
export interface InstallContent {
  title: string;
  body: ContentBlock[];
}

/** Helper: a fully-qualified node id for a tool step. */
export function toolStepId(tool: Tool, slug: string): NodeId {
  return `${tool}-${slug}`;
}
