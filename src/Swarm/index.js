/**
 * Swarm logic
 * (WIP)
 */

import { Health } from "../Health";

const { Sprite } = require("pixi.js");

/**
 * @typedef Swarm
 * @prop {string}
 */

export const Swarm = () => {
  const units = [];
  const spriteData = {};
  const unitData = {};
  const id = 0;

  const createUnit = (container, position = { x: 0, y: 0 }) => {
    const sprite = Sprite.from(spriteData.url);
    sprite.width = spriteData.width;
    sprite.height = spriteData.height;
    sprite.position.set(position.x, position.y)
    sprite.anchor.set(0.5);
    sprite.vx = 0;
    sprite.vy = 0;

    const health = Health({ maxHP: unitData.maxHP, sprite })

    const unit = {
      id: id++,
      sprite,
      health,
      maxAttackers: 0,
      attackers: 0,
    }

    units.push(unit);
  }


}