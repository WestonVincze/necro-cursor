import { Health } from "../Health";
import { Container, Sprite } from "pixi.js";
import { appService } from "../app";
import { spawnBones } from "../Drops";
import { Emitter } from "@pixi/particle-emitter";
import { explode } from "../VFX/deathFX";

export const Swarm = () => {
  let id = 0;
  const units = [];

  const createUnit = (unitData, position = { x: 0, y: 0 }, options) => {
    const { spriteContainer, particleContainer } = appService;
    const sprite = Sprite.from(unitData.url);
    sprite.width = unitData.width;
    sprite.height = unitData.height;
    sprite.anchor.set(0.5);

    let container;
    if (unitData.hideUI) {
      container = sprite;
    } else {
      container = new Container();
      container.addChild(sprite);
    }

    container.position.set(position.x, position.y);
    container.vx = 0;
    container.vy = 0;
    spriteContainer.addChild(container);

    const health = Health({ maxHP: unitData.maxHP, container });

    const unit = {
      id: `${unitData.type}-${id++}`,
      type: unitData.type,
      sprite: container,
      health,
      maxAttackers: unitData.maxAttackers,
      attackers: 0,
      ...options
    }

    units.push(unit);

    health.subscribeToDeath(() => {
      const emitter = new Emitter(particleContainer, explode({ x: container.x, y: container.y }));
      emitter.playOnceAndDestroy();
      spawnBones(container, unit.id);
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
