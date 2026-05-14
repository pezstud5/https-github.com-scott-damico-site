import Phaser from 'phaser';
import { textureKeys } from '../../game/assets/manifest';
import { defaultActions, type ActionState } from '../../game/input/actions';
import { createInitialState } from '../../game/simulation/state';
import { createSnapshot } from '../../game/simulation/state';
import { chooseUpgrade, stepSimulation } from '../../game/simulation/systems/survival';
import type { Enemy, GameState, Pickup, Projectile } from '../../game/simulation/types';
import { actionsToSimulationInput } from '../adapters/sceneBridge';

export type GameplaySceneCallbacks = {
  onSnapshot: (snapshot: ReturnType<typeof createSnapshot>) => void;
  onUpgradeChoices: (choices: GameState['upgradeChoices']) => void;
  registerControls: (controls: {
    chooseUpgrade: (upgradeId: string) => void;
    restart: () => void;
  }) => void;
};

export class GameplayScene extends Phaser.Scene {
  private callbacks: GameplaySceneCallbacks;
  private state = createInitialState();
  private actions: ActionState = { ...defaultActions };
  private dashWasDown = false;
  private playerSprite?: Phaser.GameObjects.Sprite;
  private enemySprites = new Map<number, Phaser.GameObjects.Sprite>();
  private projectileSprites = new Map<number, Phaser.GameObjects.Sprite>();
  private pickupSprites = new Map<number, Phaser.GameObjects.Sprite>();
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private background?: Phaser.GameObjects.TileSprite;

  constructor(callbacks: GameplaySceneCallbacks) {
    super('GameplayScene');
    this.callbacks = callbacks;
  }

  create() {
    this.cameras.main.setBackgroundColor('#07131f');
    this.cameras.main.setBounds(0, 0, this.state.bounds.width, this.state.bounds.height);

    this.background = this.add
      .tileSprite(0, 0, this.state.bounds.width, this.state.bounds.height, textureKeys.gridGlow)
      .setOrigin(0)
      .setAlpha(0.85);

    this.playerSprite = this.add.sprite(
      this.state.player.position.x,
      this.state.player.position.y,
      textureKeys.drone,
    );
    this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    this.keys = this.input.keyboard?.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      dash: Phaser.Input.Keyboard.KeyCodes.SPACE,
      restart: Phaser.Input.Keyboard.KeyCodes.R,
    }) as Record<string, Phaser.Input.Keyboard.Key>;

    this.callbacks.registerControls({
      chooseUpgrade: (upgradeId) => {
        chooseUpgrade(this.state, upgradeId);
        this.callbacks.onUpgradeChoices(this.state.upgradeChoices);
      },
      restart: () => this.restartRun(),
    });
    this.publish();
  }

  update(_: number, delta: number) {
    this.readInput();

    if (this.actions.restart && this.state.phase === 'gameover') {
      this.restartRun();
      return;
    }

    const dashPressed = this.actions.dash && !this.dashWasDown;
    this.dashWasDown = this.actions.dash;
    const dt = Math.min(delta / 1000, 0.033);

    stepSimulation(this.state, actionsToSimulationInput(this.actions, dashPressed), dt);
    this.syncSprites();
    this.publish();
  }

  private readInput() {
    if (!this.keys) {
      return;
    }

    this.actions = {
      up: this.keys.w.isDown || this.keys.up.isDown,
      down: this.keys.s.isDown || this.keys.down.isDown,
      left: this.keys.a.isDown || this.keys.left.isDown,
      right: this.keys.d.isDown || this.keys.right.isDown,
      dash: this.keys.dash.isDown,
      restart: this.keys.restart.isDown,
    };
  }

  private syncSprites() {
    if (!this.playerSprite) {
      return;
    }

    this.playerSprite.setPosition(this.state.player.position.x, this.state.player.position.y);
    this.playerSprite.setRotation(this.state.player.velocity.x * 0.0016);
    this.playerSprite.setAlpha(this.state.player.dashTimer > 0 ? 0.58 : 1);

    this.syncCollection(this.state.enemies, this.enemySprites, (enemy) =>
      this.add
        .sprite(enemy.position.x, enemy.position.y, enemy.kind === 'brute' ? textureKeys.brute : textureKeys.enemy)
        .setDepth(2),
    );
    this.syncCollection(this.state.projectiles, this.projectileSprites, (projectile) =>
      this.add.sprite(projectile.position.x, projectile.position.y, textureKeys.bolt).setDepth(3),
    );
    this.syncCollection(this.state.pickups, this.pickupSprites, (pickup) =>
      this.add.sprite(pickup.position.x, pickup.position.y, textureKeys.salvage).setDepth(1),
    );

    for (const enemy of this.state.enemies) {
      const sprite = this.enemySprites.get(enemy.id);
      sprite?.setPosition(enemy.position.x, enemy.position.y);
      sprite?.setScale(enemy.kind === 'brute' ? 1.05 : 1);
    }

    for (const projectile of this.state.projectiles) {
      const sprite = this.projectileSprites.get(projectile.id);
      sprite?.setPosition(projectile.position.x, projectile.position.y);
      sprite?.setAlpha(Math.max(0.25, projectile.ttl));
    }

    for (const pickup of this.state.pickups) {
      const sprite = this.pickupSprites.get(pickup.id);
      sprite?.setPosition(pickup.position.x, pickup.position.y);
      sprite?.setScale(0.9 + Math.sin(this.time.now * 0.008 + pickup.id) * 0.08);
    }

    this.background?.setTilePosition(this.cameras.main.scrollX * 0.16, this.cameras.main.scrollY * 0.16);
  }

  private syncCollection<T extends Enemy | Projectile | Pickup>(
    items: T[],
    sprites: Map<number, Phaser.GameObjects.Sprite>,
    createSprite: (item: T) => Phaser.GameObjects.Sprite,
  ) {
    const liveIds = new Set(items.map((item) => item.id));

    for (const [id, sprite] of sprites) {
      if (!liveIds.has(id)) {
        sprite.destroy();
        sprites.delete(id);
      }
    }

    for (const item of items) {
      if (!sprites.has(item.id)) {
        sprites.set(item.id, createSprite(item));
      }
    }
  }

  private restartRun() {
    for (const sprite of [...this.enemySprites.values(), ...this.projectileSprites.values(), ...this.pickupSprites.values()]) {
      sprite.destroy();
    }
    this.enemySprites.clear();
    this.projectileSprites.clear();
    this.pickupSprites.clear();
    this.state = createInitialState();
    this.callbacks.onUpgradeChoices([]);
    this.publish();
  }

  private publish() {
    this.callbacks.onSnapshot(createSnapshot(this.state));

    if (this.state.phase === 'upgrade') {
      this.callbacks.onUpgradeChoices(this.state.upgradeChoices);
    }
  }
}
