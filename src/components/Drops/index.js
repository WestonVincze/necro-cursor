/**
 * Utility script for managing items and item drops
 */

import { Sprite } from "pixi.js";
import { appService, gameState } from "/src/app";
import { take } from "rxjs";

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
      () => removeBones({id, sprite, method: "despawn" })
    )

  return sprite;
}

export const removeBones = ({ id, sprite, method }) => {
  if (sprite.destroyed) return;

  method === "despawn" && gameState.incrementBonesDespawned();

  try {
    sprite.destroy();
    bones = [...bones.filter(b => b.id !== id)];
  } catch (e) {
    console.error(e);
  }
}