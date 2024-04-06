import { Unit } from "../../data/units";

// dice rolls are 0 inclusive
const rollDice = (sides, bonus = 0) => {
  return Math.round(Math.random() * sides) + bonus;
}

const rollToHit = (difficulty, bonus = 0) => {
  return rollDice(20, bonus) >= difficulty;
}

const rollToCrit = (critChance) => {
  return rollDice(100) + critChance >= 100;
}

/**
 * @param {Unit} attackerStats 
 * @param {Unit} target 
 */
export const attackTarget = (attackerStats, target) => {
  if (!target.health) {
    console.error("invalid attack target")
    return false;
  }

  let damage = 0;
  let critMod = 1;

  if (rollToHit(target.stats.armor, attackerStats.attackBonus)) {
    damage = rollDice(attackerStats.maxHit, attackerStats.damageBonus);
  }

  if (attackerStats.critChance && rollToCrit(attackerStats.critChance)) {
    console.log("CRIT");
    critMod = attackerStats.critDamage;
  }

  target.health.takeDamage(damage * critMod);

  // check for and apply effects like knockback...

  return true;
}