import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameplayScene, type GameplaySceneCallbacks } from './scenes/GameplayScene';

type CreateGameOptions = GameplaySceneCallbacks & {
  parent: HTMLElement;
};

export function createNeonSalvageGame(options: CreateGameOptions) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: options.parent,
    width: 1280,
    height: 720,
    backgroundColor: '#07131f',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
    scene: [BootScene, new GameplayScene(options)],
  });
}
