import { Unit } from "../../data/units";

const rollDice = (sides, bonus = 0) => {
  return Math.floor(Math.random() * sides) + 1 + bonus;
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

  console.log('rolling to hit')
  if (!rollToHit(target.stats.armor, attackerStats.attackBonus)) return false;
  console.log('HIT')

  const damage = rollDice(attackerStats.maxHit, attackerStats.damageBonus);

  let critMod = 1;
  if (attackerStats.critChance && rollToCrit(attackerStats.critChance)) {
    console.log("CRIT");
    critMod = attackerStats.critMod;
  }

  target.health.takeDamage(damage * critMod);

  // check for and apply effects like knockback...

  return true;
}