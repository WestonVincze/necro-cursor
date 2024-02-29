/**
 * Utility script for managing items and item drops
 */

import { Sprite } from "pixi.js";
import { appService } from "../app";

export let bones = [];

export const spawnBones = ({ x, y }, id) => {
  const { spriteContainer } = appService;
  const sprite = Sprite.from("assets/bones.png");
  sprite.anchor.set(0.5);
  sprite.width = 50;
  sprite.height = 35;
  sprite.position.set(x, y);

  spriteContainer.addChild(sprite);

  bones.push({ id, sprite });

  // TODO: add UI indicator for timeout
  setTimeout(() => { 
    if (bones.filter(b => b.id === id)[0]) {
      removeBones({ id, sprite })
    }
  }, 30000);

  return sprite;
}

export const removeBones = ({ id, sprite }) => {
  if (!sprite) return;
  try {
    sprite.destroy();
    bones = [...bones.filter(b => b.id !== id)];
  } catch (e) {
    console.error(e);
  }
}