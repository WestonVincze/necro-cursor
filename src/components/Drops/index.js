/**
 * Utility script for managing items and item drops
 */

import { Sprite } from "pixi.js";
import { appService } from "/src/app";
import { take, takeUntil } from "rxjs";

export let bones = [];
const despawnTickCount = 75;
const flashTickCount = 50;

export const spawnBones = ({ x, y }, id) => {
  const { gameTicks$, spriteContainer } = appService;
  const sprite = Sprite.from("assets/bones.png");
  sprite.anchor.set(0.5);
  sprite.width = 50;
  sprite.height = 35;
  sprite.position.set(x, y);

  spriteContainer.addChild(sprite);

  bones.push({ id, sprite });

  gameTicks$
    .pipe(
      take(despawnTickCount)
    )
    .subscribe(
      t => {
        if (t < flashTickCount) return;
        sprite.alpha = sprite.alpha === 1 ? 0.5 : 1; 
      },
      null,
      () => removeBones({id, sprite})
    )

  return sprite;
}

export const removeBones = ({ id, sprite }) => {
  if (sprite.destroyed) return;

  try {
    sprite.destroy();
    bones = [...bones.filter(b => b.id !== id)];
  } catch (e) {
    console.error(e);
  }
}