export type Vec2 = {
  x: number;
  y: number;
};

export type EnemyKind = 'scout' | 'brute';

export type Enemy = {
  id: number;
  kind: EnemyKind;
  position: Vec2;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  damage: number;
};

export type Projectile = {
  id: number;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  damage: number;
  ttl: number;
};

export type Pickup = {
  id: number;
  position: Vec2;
  radius: number;
  value: number;
};

export type Player = {
  position: Vec2;
  velocity: Vec2;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  dashCooldown: number;
  dashTimer: number;
  fireCooldown: number;
  magnetRange: number;
  projectileDamage: number;
  projectileSpeed: number;
};

export type UpgradeOption = {
  id: string;
  title: string;
  description: string;
};

export type UpgradeId = 'dash' | 'pulse' | 'shield' | 'magnet' | 'engine';

export type GamePhase = 'running' | 'upgrade' | 'gameover';

export type GameState = {
  phase: GamePhase;
  bounds: {
    width: number;
    height: number;
  };
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  pickups: Pickup[];
  score: number;
  salvage: number;
  level: number;
  nextLevelAt: number;
  elapsed: number;
  wave: number;
  spawnTimer: number;
  nextId: number;
  upgrades: Record<UpgradeId, number>;
  upgradeChoices: UpgradeOption[];
  message: string;
};

export type SimulationInput = {
  moveX: number;
  moveY: number;
  dashPressed: boolean;
};

export type GameSnapshot = {
  phase: GamePhase;
  hp: number;
  maxHp: number;
  score: number;
  salvage: number;
  level: number;
  nextLevelAt: number;
  elapsed: number;
  wave: number;
  enemyCount: number;
  message: string;
};
