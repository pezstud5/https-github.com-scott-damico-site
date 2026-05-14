import type { ActionState } from '../../game/input/actions';
import type { SimulationInput } from '../../game/simulation/types';

export function actionsToSimulationInput(actions: ActionState, dashPressed: boolean): SimulationInput {
  return {
    moveX: Number(actions.right) - Number(actions.left),
    moveY: Number(actions.down) - Number(actions.up),
    dashPressed,
  };
}
