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

import { Sprite, Container } from "pixi.js"
import { appService } from "../../app";
import { Health } from "../Health";
import { isIntersectingRect } from "../Colliders/isIntersecting";
import { attackTarget } from "../Attack";
import { units } from "../../data/units";
import { take, finalize } from "rxjs";

// TODO: create unit based on unit name, do not force other scripts to collect unitData
export const createUnit = (id, unitName, position, options) => {
  const unitData = units[unitName];
  if (!unitData) {
    console.error(`${unitName} is not a valid unit.`); 
    return;
  }

  const { gameTicks$, spriteContainer } = appService;
  const _stats = unitData.stats;
  let _targetType = null;
  let _target = null; // unit or null
  let _canAttack = _stats.maxHit > 0; // always false if there is no max hit

  let level = 0;

  // configure sprite
  let sprite = null;

  sprite = Sprite.from(unitData.url);
  sprite.width = unitData.width;
  sprite.height = unitData.height;
  sprite.anchor.set(0.5);

  if (!unitData.hideUI) {
    const container = new Container();
    container.addChild(sprite);
    sprite = container;
  }

  sprite.position.set(position.x, position.y);
  sprite.vx = 0;
  sprite.vy = 0;
  spriteContainer.addChild(sprite);

  const health = Health({ maxHP: _stats.maxHP, container: sprite, hideHealthBar: unitData.hideUI });

  const checkForStat = (stat) => {
    if (!_stats.hasOwnProperty(stat)) {
      console.error(`Invalid stat: ${stat}`);
      return false;
    }

    return true;
  }

  const getStat = (stat) => _stats[stat];

  const setStat = (stat, value) => {
    if (!checkForStat(stat)) return;

    _stats[stat] = value;
  }

  const addToStat = (stat, value) => {
    if (!checkForStat(stat)) return;

    _stats[stat] += value;
  }

  // finds the closest available target or returns null if none found
  // run every tick?
  const assignClosestTarget = (type) => {
    if (!_targetType) {
      console.error("No target type set.");
      return;
    }

    // search game state for targetType... assign closest potential target to _target
  }

  let attackTicks = null;
  const setTarget = (target) => {
    if (_target === target) return;
    _target = target;
    attackTicks = gameTicks$.subscribe(tryAttack);
  }

  const clearTarget = () => {
    _target = null;
    attackTicks.unsubscribe();
    attackTicks = null;
  }

  // target = { health, x, y }
  const tryAttack = () => {
    // check if can attack and target is set
    if (!_canAttack || _target === null) return;

    // check if in range
    if(!isIntersectingRect(sprite, _target.sprite, _stats.attackRange)) return;

    attackTarget(_stats, _target);

    _canAttack = false;
    // TODO: check for potential memory leaks here
    gameTicks$
      .pipe(
        take(_stats.attackSpeed + 1),
        finalize(() => _canAttack = true),
      ).subscribe();
  }

  const unit = {
    id,
    name: unitName,
    level, // TODO: encapsulate this?
    sprite,
    health,
    getStat,
    addToStat,
    setStat,
    setTarget,
    clearTarget,
    ...options // might want to remove this
  }

  // define public accessors
  Object.defineProperties(unit, {
    target: {
      get: () => _target,
      enumerable: true,
    },
    stats: {
      get: () => ({ ..._stats }),
      enumerable: true,
    },
    targetType: {
      get: () => _targetType,
      enumerable: true,
    }
  })

  return unit;
}