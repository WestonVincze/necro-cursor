import { Health } from "../Health";
import { Sprite } from "pixi.js";
import { appService } from "../app";
import { spawnBones } from "../Drops";

/**
 * @typedef Swarm
 * @prop {string} TODO
 */

export const Swarm = () => {
  let id = 0;
  const units = []

  const createUnit = (unitData, position = { x: 0, y: 0 }) => {
    const { spriteContainer, UIContainer } = appService;
    const sprite = Sprite.from(unitData.url);
    sprite.width = unitData.width;
    sprite.height = unitData.height;
    sprite.position.set(position.x, position.y);
    sprite.anchor.set(0.5);
    sprite.vx = 0;
    sprite.vy = 0;
    spriteContainer.addChild(sprite);

    const health = Health({ maxHP: unitData.maxHP, sprite });
    UIContainer.addChild(health.healthBar.container);

    const unit = {
      id: id++,
      sprite,
      health,
      maxAttackers: unitData.maxAttackers,
      attackers: 0,
    }

    units.push(unit);

    health.subscribeToDeath(() => {
      spawnBones(sprite, unit.id);
      removeUnit(unit.id);
    })

    return unit;
  }

  const removeUnit = (id) => {
    let unit = getUnitById(id);
    unit.sprite.destroy();
    const i = units.findIndex(u => u.id === id)
    units.splice(i, 1);
    // units = [...units.filter(u => u.id !== id)];
  }

  const addAttacker = (id) => {
    const unit = getUnitById(id);
    if (unit.attackers + 1 > unit.maxAttackers) return false;
    unit.attackers++;
    return true;
  }

  const getUnitById = (id) => {
    return units.find(unit => unit.id === id);
  }

  return {
    units,
    createUnit,
    removeUnit,
    addAttacker,
    getUnitById,
  }
}
