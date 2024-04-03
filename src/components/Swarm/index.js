import { createUnit } from "../Unit";
import { spawnBones } from "/src/components/Drops";
import { Emitter } from "@pixi/particle-emitter";
import { explode } from "/src/VFX/deathFX";
import { appService } from "../../app";

/**
 * Let's add some object pooling to reduce the workload of creating and destroying units
 * make it optional, and set multiple pools for types of minions
 */

export const Swarm = () => {
  let id = 0;
  const units = [];

  const addUnit = (unitName, position = { x: 0, y: 0 }, options) => {
    const { particleContainer } = appService;
    const unit = createUnit(`${unitName}-${id++}`, unitName, position, options);

    units.push(unit);

    unit.health.subscribeToDeath(() => {
      const emitter = new Emitter(particleContainer, explode({ x: unit.sprite.x, y: unit.sprite.y }));
      emitter.playOnceAndDestroy();
      spawnBones(unit.sprite, unit.id);
      removeUnit(unit.id);
    })

    return unit;
  }

  const removeUnit = (id) => {
    let unit = getUnitById(id);
    unit.sprite.destroy();
    const i = units.findIndex(u => u.id === id)
    units.splice(i, 1);
  }

  const addAttacker = (id) => {
    const unit = getUnitById(id);
    if (unit.attackers + 1 > unit.maxAttackers) return false;
    unit.attackers++;
    return true;
  }

  const removeAttacker = (id) => {
    const unit = getUnitById(id);
    if (unit.attackers === 0) return false;
    unit.attackers--;
    return true;
  }

  const getUnitById = (id) => {
    return units.find(unit => unit.id === id);
  }

  return {
    units,
    addUnit,
    removeUnit,
    addAttacker,
    removeAttacker,
    getUnitById,
  }
}
