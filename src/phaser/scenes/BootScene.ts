import Phaser from 'phaser';
import { textureKeys } from '../../game/assets/manifest';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createTexture(textureKeys.drone, 42, 42, (graphics) => {
      graphics.fillStyle(0x9dfcff, 1);
      graphics.fillCircle(21, 21, 15);
      graphics.lineStyle(4, 0x101821, 1);
      graphics.strokeCircle(21, 21, 17);
      graphics.fillStyle(0xfff27a, 1);
      graphics.fillTriangle(21, 2, 27, 19, 15, 19);
    });

    this.createTexture(textureKeys.enemy, 34, 34, (graphics) => {
      graphics.fillStyle(0xff4d6d, 1);
      graphics.fillCircle(17, 17, 14);
      graphics.lineStyle(3, 0x2c0f22, 1);
      graphics.strokeCircle(17, 17, 15);
    });

    this.createTexture(textureKeys.brute, 54, 54, (graphics) => {
      graphics.fillStyle(0xff8d4d, 1);
      graphics.fillRoundedRect(8, 8, 38, 38, 8);
      graphics.lineStyle(4, 0x2c0f22, 1);
      graphics.strokeRoundedRect(8, 8, 38, 38, 8);
    });

    this.createTexture(textureKeys.salvage, 24, 24, (graphics) => {
      graphics.fillStyle(0xf9f871, 1);
      graphics.fillCircle(12, 12, 8);
      graphics.lineStyle(2, 0xffffff, 0.8);
      graphics.strokeCircle(12, 12, 10);
    });

    this.createTexture(textureKeys.bolt, 18, 18, (graphics) => {
      graphics.fillStyle(0xb68cff, 1);
      graphics.fillCircle(9, 9, 7);
      graphics.fillStyle(0xffffff, 0.9);
      graphics.fillCircle(9, 9, 3);
    });

    this.createTexture(textureKeys.gridGlow, 128, 128, (graphics) => {
      graphics.lineStyle(1, 0x2ee6d6, 0.24);
      graphics.strokeRect(0, 0, 128, 128);
      graphics.lineStyle(1, 0x955cff, 0.14);
      graphics.lineBetween(0, 64, 128, 64);
      graphics.lineBetween(64, 0, 64, 128);
    });

    this.scene.start('GameplayScene');
  }

  private createTexture(
    key: string,
    width: number,
    height: number,
    draw: (graphics: Phaser.GameObjects.Graphics) => void,
  ) {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    draw(graphics);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}
