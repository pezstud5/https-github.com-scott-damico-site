import type {
  Enemy,
  GameState,
  Pickup,
  Projectile,
  SimulationInput,
  UpgradeId,
  UpgradeOption,
  Vec2,
} from '../types';

const upgrades: Record<UpgradeId, UpgradeOption> = {
  dash: {
    id: 'dash',
    title: 'Blink Dash',
    description: 'Shorter dash cooldown and a longer invulnerable burst.',
  },
  pulse: {
    id: 'pulse',
    title: 'Arc Pulse',
    description: 'Faster shots with higher bolt damage.',
  },
  shield: {
    id: 'shield',
    title: 'Battery Shield',
    description: 'Repair 28 hull and raise max hull.',
  },
  magnet: {
    id: 'magnet',
    title: 'Salvage Magnet',
    description: 'Pull energy cores from farther away.',
  },
  engine: {
    id: 'engine',
    title: 'Overclocked Motors',
    description: 'Move faster and thread through swarms more easily.',
  },
};

export function stepSimulation(state: GameState, input: SimulationInput, dt: number) {
  if (state.phase !== 'running') {
    return;
  }

  state.elapsed += dt;
  state.wave = Math.max(1, Math.floor(state.elapsed / 24) + 1);

  updatePlayer(state, input, dt);
  updateSpawns(state, dt);
  updateProjectiles(state, dt);
  updateEnemies(state, dt);
  updatePickups(state, dt);
  resolveCombat(state);
  checkLevelUp(state);

  if (state.player.hp <= 0) {
    state.player.hp = 0;
    state.phase = 'gameover';
    state.message = 'Drone offline. Reboot to try another salvage run.';
  }
}

export function chooseUpgrade(state: GameState, upgradeId: string) {
  if (state.phase !== 'upgrade') {
    return;
  }

  const id = upgradeId as UpgradeId;
  state.upgrades[id] += 1;

  if (id === 'dash') {
    state.player.dashCooldown = Math.max(0, state.player.dashCooldown - 0.25);
  }

  if (id === 'pulse') {
    state.player.projectileDamage += 8;
    state.player.fireCooldown = Math.max(0.16, state.player.fireCooldown - 0.045);
  }

  if (id === 'shield') {
    state.player.maxHp += 16;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 28);
  }

  if (id === 'magnet') {
    state.player.magnetRange += 46;
  }

  if (id === 'engine') {
    state.player.speed += 24;
  }

  state.phase = 'running';
  state.upgradeChoices = [];
  state.message = `${upgrades[id].title} installed. Keep moving.`;
}

function updatePlayer(state: GameState, input: SimulationInput, dt: number) {
  const player = state.player;
  const move = normalize({ x: input.moveX, y: input.moveY });
  const isDashing = player.dashTimer > 0;
  const dashSpeed = isDashing ? 720 : 0;
  const speed = player.speed + dashSpeed;

  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.dashTimer = Math.max(0, player.dashTimer - dt);

  if (input.dashPressed && player.dashCooldown <= 0 && (move.x !== 0 || move.y !== 0)) {
    player.dashTimer = 0.18 + state.upgrades.dash * 0.03;
    player.dashCooldown = Math.max(0.75, 1.45 - state.upgrades.dash * 0.15);
  }

  player.velocity.x = move.x * speed;
  player.velocity.y = move.y * speed;
  player.position.x = clamp(player.position.x + player.velocity.x * dt, 36, state.bounds.width - 36);
  player.position.y = clamp(player.position.y + player.velocity.y * dt, 36, state.bounds.height - 36);

  player.fireCooldown -= dt;
  if (player.fireCooldown <= 0) {
    fireAtNearestEnemy(state);
    player.fireCooldown = Math.max(0.16, 0.5 - state.upgrades.pulse * 0.055);
  }
}

function updateSpawns(state: GameState, dt: number) {
  state.spawnTimer -= dt;
  if (state.spawnTimer > 0) {
    return;
  }

  const pressure = Math.min(9, 2 + Math.floor(state.elapsed / 35));
  const spawnCount = state.enemies.length < 24 + state.wave * 4 ? pressure : 1;

  for (let i = 0; i < spawnCount; i += 1) {
    state.enemies.push(createEnemy(state));
  }

  state.spawnTimer = Math.max(0.38, 2.1 - state.wave * 0.16);
}

function updateProjectiles(state: GameState, dt: number) {
  for (const projectile of state.projectiles) {
    projectile.position.x += projectile.velocity.x * dt;
    projectile.position.y += projectile.velocity.y * dt;
    projectile.ttl -= dt;
  }

  state.projectiles = state.projectiles.filter((projectile) => projectile.ttl > 0);
}

function updateEnemies(state: GameState, dt: number) {
  for (const enemy of state.enemies) {
    const toPlayer = normalize({
      x: state.player.position.x - enemy.position.x,
      y: state.player.position.y - enemy.position.y,
    });

    enemy.position.x += toPlayer.x * enemy.speed * dt;
    enemy.position.y += toPlayer.y * enemy.speed * dt;
  }
}

function updatePickups(state: GameState, dt: number) {
  for (const pickup of state.pickups) {
    const offset = {
      x: state.player.position.x - pickup.position.x,
      y: state.player.position.y - pickup.position.y,
    };
    const distance = length(offset);

    if (distance < state.player.magnetRange) {
      const pull = normalize(offset);
      pickup.position.x += pull.x * 380 * dt;
      pickup.position.y += pull.y * 380 * dt;
    }
  }

  const collected: Pickup[] = [];
  state.pickups = state.pickups.filter((pickup) => {
    if (distanceBetween(pickup.position, state.player.position) <= pickup.radius + state.player.radius) {
      collected.push(pickup);
      return false;
    }
    return true;
  });

  for (const pickup of collected) {
    state.salvage += pickup.value;
    state.score += pickup.value * 18;
  }
}

function resolveCombat(state: GameState) {
  const defeated = new Set<number>();
  const spentProjectiles = new Set<number>();

  for (const projectile of state.projectiles) {
    for (const enemy of state.enemies) {
      if (defeated.has(enemy.id)) {
        continue;
      }

      if (distanceBetween(projectile.position, enemy.position) <= projectile.radius + enemy.radius) {
        enemy.hp -= projectile.damage;
        spentProjectiles.add(projectile.id);

        if (enemy.hp <= 0) {
          defeated.add(enemy.id);
          state.score += enemy.kind === 'brute' ? 85 : 45;
          state.pickups.push(createPickup(state, enemy.position, enemy.kind === 'brute' ? 3 : 1));
        }
        break;
      }
    }
  }

  state.projectiles = state.projectiles.filter((projectile) => !spentProjectiles.has(projectile.id));
  state.enemies = state.enemies.filter((enemy) => !defeated.has(enemy.id));

  if (state.player.dashTimer > 0) {
    return;
  }

  for (const enemy of state.enemies) {
    if (distanceBetween(enemy.position, state.player.position) <= enemy.radius + state.player.radius) {
      state.player.hp -= enemy.damage;
      const knockback = normalize({
        x: enemy.position.x - state.player.position.x,
        y: enemy.position.y - state.player.position.y,
      });
      enemy.position.x += knockback.x * 38;
      enemy.position.y += knockback.y * 38;
    }
  }
}

function checkLevelUp(state: GameState) {
  if (state.salvage < state.nextLevelAt) {
    return;
  }

  state.level += 1;
  state.nextLevelAt += Math.ceil(8 + state.level * 5.5);
  state.phase = 'upgrade';
  state.upgradeChoices = rollUpgradeChoices(state);
  state.message = 'Upgrade window open. Pick one module.';
}

function fireAtNearestEnemy(state: GameState) {
  if (state.enemies.length === 0) {
    return;
  }

  const nearest = state.enemies.reduce((best, enemy) => {
    const bestDistance = distanceBetween(best.position, state.player.position);
    const enemyDistance = distanceBetween(enemy.position, state.player.position);
    return enemyDistance < bestDistance ? enemy : best;
  });
  const direction = normalize({
    x: nearest.position.x - state.player.position.x,
    y: nearest.position.y - state.player.position.y,
  });

  state.projectiles.push({
    id: state.nextId++,
    position: { ...state.player.position },
    velocity: {
      x: direction.x * state.player.projectileSpeed,
      y: direction.y * state.player.projectileSpeed,
    },
    radius: 7,
    damage: state.player.projectileDamage,
    ttl: 1.1,
  } satisfies Projectile);
}

function createEnemy(state: GameState): Enemy {
  const side = Math.floor(Math.random() * 4);
  const margin = 72;
  const position = {
    x:
      side === 0
        ? -margin
        : side === 1
          ? state.bounds.width + margin
          : Math.random() * state.bounds.width,
    y:
      side === 2
        ? -margin
        : side === 3
          ? state.bounds.height + margin
          : Math.random() * state.bounds.height,
  };
  const isBrute = Math.random() < Math.min(0.3, 0.05 + state.wave * 0.025);
  const hp = isBrute ? 80 + state.wave * 9 : 34 + state.wave * 5;

  return {
    id: state.nextId++,
    kind: isBrute ? 'brute' : 'scout',
    position,
    radius: isBrute ? 24 : 16,
    speed: isBrute ? 92 + state.wave * 5 : 118 + state.wave * 8,
    hp,
    maxHp: hp,
    damage: isBrute ? 1.45 : 0.8,
  };
}

function createPickup(state: GameState, position: Vec2, value: number): Pickup {
  return {
    id: state.nextId++,
    position: { ...position },
    radius: 11,
    value,
  };
}

function rollUpgradeChoices(state: GameState): UpgradeOption[] {
  const ids = (Object.keys(upgrades) as UpgradeId[]).sort(() => Math.random() - 0.5);
  return ids.slice(0, 3).map((id) => ({
    ...upgrades[id],
    title: `${upgrades[id].title} ${roman(state.upgrades[id] + 1)}`,
  }));
}

function normalize(vector: Vec2): Vec2 {
  const magnitude = length(vector);
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
}

function length(vector: Vec2) {
  return Math.hypot(vector.x, vector.y);
}

function distanceBetween(a: Vec2, b: Vec2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roman(value: number) {
  return ['I', 'II', 'III', 'IV', 'V', 'VI'][Math.min(value - 1, 5)];
}
