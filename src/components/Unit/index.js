/**
 * "UNIT" -> anything that can attack or be attacked
 * 
 * type -> type of unit (guard, paladin, skeleton, player, etc)
 * possibleTargets -> array of unit types the unit can attack
 * canAttack -> boolean value (likely Subject) that determines whether or not a unit can attack
 * 
 * "HEALTH" (maxHP, currentHP)
 * A/C -> chance to be hit
 * ARMOR
 * material -> the type of material the unit is comprised of (will be used for SFX and VFX -> metal would make a "clang" and emit sparks)
 * 
 * AttackSpeed -> how often the unit can attack
 * Damage -> how much damage the unit deals
 * Accuracy -> base accuracy of attacker
 * Crit% -> chance to crit
 * CritDmg -> critical hit damage multiplier
 * knockBack -> how much force the attack has 
 * Range -> how far from the target the unit needs to be
 * 
 * 
 * dynamic values?
 * target -> the current target of the unit
 * isInRange -> whether or not the unit is in range of the target
 * ticksUntilCanAttack -> the number of ticks that need to happen before unit can attack
 * 
 * 
 * 
 */

import { appService } from "../../app";
import { Health } from "../Health";
import { isIntersectingRect } from "../Colliders/isIntersecting";
import { Sprite, Container } from "pixi.js"

export const Unit = () => {
  let sprite = null;
  let canAttack = true;
  let target = null; // object containing id and sprite
  let isInRange = false;
  let attackRange = 0;
  let damage = 0;

  const initializeUnit = (unitData, position, options) => {
    const { spriteContainer } = appService;
    sprite = Sprite.from(unitData.url);
    sprite.width = unitData.width;
    sprite.height = unitData.height;
    sprite.anchor.set(0.5);

    attackRange = unitData.attackRange;
    damage = unitData.damage;

    if (!unitData.hideUI) {
      const container = new Container();
      container.addChild(sprite);
      sprite = container;
    }

    sprite.position.set(position.x, position.y);
    sprite.vx = 0;
    sprite.vy = 0;
    spriteContainer.addChild(sprite);

    const health = Health({ maxHP: unitData.maxHP, container });

    return {
      id, 
      type: unitData.type,
      sprite,
      health,
      ...options
    }
  }

  // finds the closest available target or returns null if none found
  // run every tick?
  const checkForClosestTarget = (type) => {}

  // target = { health, x, y }
  const tryAttack = () => {
    if (!canAttack || !target) return;

    // check if in Range
    isInRange = isIntersectingRect(sprite, target.sprite, attackRange);

    if (isInRange) {
      target.health.takeDamage(damage);
      // spawn hitSplat
    }
  }
}