/**
 * Utility script for managing items and item drops
 */

import { Sprite } from "pixi.js";
import { appService, gameState } from "/src/app";
import { take } from "rxjs";
import { getRandomElement } from "../../helpers";
import { itemData } from "../../data/items";

let itemCount = 0;
const despawnTickCount = 75;
const flashTickCount = 50;

const rollForLoot = (dropTable) => {
  // common is 50% 
  // rare is 5%
  // legendary is 0.5%
  const drops = dropTable.always?.length > 0 ? [...dropTable.always] : [];

  const roll = Math.random() * 100;
  if (dropTable.legendary?.length > 0 && roll >= 99.5) {
    drops.push(getRandomElement(dropTable.legendary));
  } else if (dropTable.rare?.length > 0 && roll >= 95) {
    drops.push(getRandomElement(dropTable.rare));
  } else if (dropTable.common?.length > 0 && roll >= 50) {
    drops.push(getRandomElement(dropTable.common));
  }

  return drops;
}

export const spawnDrops = (position, dropTable) => {
  const drops = rollForLoot(dropTable);
  if (drops.length === 0) return;

  drops.forEach(drop => {
    spawnItem(drop, position);
  })
}

export const spawnItem = (name, { x, y }, ticksToDespawn = 75) => {
  const item = itemData[name];
  if (!item) {
    console.error(`${name} is not a valid item.`);
    return;
  }

  const { gameTicks$, spriteContainer } = appService;

  itemCount++;

  const sprite = Sprite.from(item.url);
  sprite.width = item.width;
  sprite.height = item.height;
  sprite.anchor.set(0.5);
  sprite.position.set(x, y);

  spriteContainer.addChild(sprite);

  if (!gameState.items[item.type]) {
    gameState.items[item.type] = [];
  }

  const id = `${name}-${itemCount}`;
  gameState.items[item.type].push({ name, id, sprite, stats: item.stats });

  if (ticksToDespawn > 0) {
    gameTicks$
      .pipe(
        take(despawnTickCount)
      )
      .subscribe(
        tickCount => {
          if (tickCount < flashTickCount) return;
          sprite.alpha = sprite.alpha === 1 ? 0.5 : 1; 
        },
        null,
        () => removeItem(name, { id, sprite, method: "despawn" })
      )
  }
}

export const removeItem = (type, { id, sprite, method }) => {
  if (sprite.destroyed) return;

  if (type === "bones" && method === "despawn") {
    gameState.incrementBonesDespawned();
  } 

  try {
    sprite.destroy();
    // TODO: if multiple bones are being removed at once we can be more efficient
    gameState.items[type] = [...gameState.items[type].filter(i => i.id !== id)];
  } catch (e) {
    console.error(e);
  }
}