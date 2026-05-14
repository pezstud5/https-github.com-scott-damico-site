import type { GameState, UpgradeId } from './types';

export function createInitialState(): GameState {
  return {
    phase: 'running',
    bounds: {
      width: 1600,
      height: 1000,
    },
    player: {
      position: { x: 800, y: 500 },
      velocity: { x: 0, y: 0 },
      radius: 18,
      hp: 100,
      maxHp: 100,
      speed: 285,
      dashCooldown: 0,
      dashTimer: 0,
      fireCooldown: 0.2,
      magnetRange: 115,
      projectileDamage: 22,
      projectileSpeed: 650,
    },
    enemies: [],
    projectiles: [],
    pickups: [],
    score: 0,
    salvage: 0,
    level: 1,
    nextLevelAt: 8,
    elapsed: 0,
    wave: 1,
    spawnTimer: 0.4,
    nextId: 1,
    upgrades: {
      dash: 0,
      pulse: 0,
      shield: 0,
      magnet: 0,
      engine: 0,
    } satisfies Record<UpgradeId, number>,
    upgradeChoices: [],
    message: 'Collect salvage. Survive the security sweep.',
  };
}

export function createSnapshot(state: GameState) {
  return {
    phase: state.phase,
    hp: state.player.hp,
    maxHp: state.player.maxHp,
    score: state.score,
    salvage: state.salvage,
    level: state.level,
    nextLevelAt: state.nextLevelAt,
    elapsed: state.elapsed,
    wave: state.wave,
    enemyCount: state.enemies.length,
    message: state.message,
  };
}
