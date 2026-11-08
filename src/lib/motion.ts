// Shared motion settings, so the whole site moves with one rhythm (Emil
// Kowalski's guidance: interface pieces settle without bouncing; playful
// things may overshoot a little; keyboard-driven UI doesn't animate at all).

/** Strong ease-out: fast start, gentle landing. For things entering or reacting. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Menus, dialogs, tabs, notices: quick and no overshoot. */
export const SPRING_UI = { type: "spring", duration: 0.3, bounce: 0 } as const;
/** Playful moments (drags, toys, celebrations): a touch of bounce. */
export const SPRING_PLAYFUL = { type: "spring", duration: 0.5, bounce: 0.2 } as const;
/** Sections rising into view as you scroll. */
export const REVEAL = { duration: 0.5, ease: EASE_OUT } as const;
