export type ActionName = 'up' | 'down' | 'left' | 'right' | 'dash' | 'restart';

export type ActionState = Record<ActionName, boolean>;

export const defaultActions: ActionState = {
  up: false,
  down: false,
  left: false,
  right: false,
  dash: false,
  restart: false,
};
