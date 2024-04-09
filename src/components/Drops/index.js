/**
 * Utility script for managing items and item drops
 */

import { Sprite } from "pixi.js";
import { appService, gameState } from "/src/app";
import { take } from "rxjs";
import { getRandomElements } from "../../helpers";
import { itemData } from "../../data/items";

// TODO: move to gameState and change to "items" once we have more items
export let items = {};
export let bones = items.bones || [];
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
    drops.push(getRandomElements(dropTable.legendary, 1));
  } else if (dropTable.rare?.length > 0 && roll >= 95) {
    drops.push(getRandomElements(dropTable.rare, 1));
  } else if (dropTable.common?.length > 0 && roll >= 50) {
    drops.push(getRandomElements(dropTable.common, 1));
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

  if (!items[name]) {
    items[name] = [];
  }

  const id = `${name}-${itemCount}`;
  items[name].push({ name, id, sprite });

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

export const removeItem = (name, { id, sprite, method }) => {
  if (sprite.destroyed) return;

  name === "bones" && method === "despawn" && gameState.incrementBonesDespawned();

  try {
    sprite.destroy();
    // TODO: if multiple bones are being removed at once we can be more efficient
    items[name] = [...items[name].filter(i => i.id !== id)];
  } catch (e) {
    console.error(e);
  }
}