import Phaser from 'phaser';
import { MenuScene, LevelSelectScene, SettingsScene, RaceIntroScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import './style.css';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#101712',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: window.innerWidth, height: window.innerHeight },
  physics: { default: 'arcade', arcade: { debug: false } },
  render: { powerPreference: 'high-performance', pixelArt: true, antialias: false },
  scene: [MenuScene, LevelSelectScene, SettingsScene, RaceIntroScene, GameScene]
});
window.addEventListener('beforeunload',()=>game.destroy(true));
