// @ts-check

// TODO: change current "type" values to "name" and change "type" to be "enemy | minion | player"
/**
 * @typedef {Object} Unit 
 * @prop {string} name 
 * @prop {string} type
 * @prop {string} url
 * @prop {number} width
 * @prop {number} height
 * @prop {Stats} stats
 * @prop {number} [exp] // change to expReward?
 * @prop {boolean} [hideUI]
 * @prop {number} [maxAttackers] // remove this
 * @prop {function} [behavior] - defines the "brain"
 */

/**
 * @typedef {Object} Stats
 * @prop {number} maxHP
 * @prop {number} armor
 * @prop {number} [HPregeneration]
 * @prop {number} [moveSpeed]
 * @prop {number} [maxSpeed]
 * @prop {number} [attackSpeed]
 * @prop {number} [attackRange]
 * @prop {number} [attackBonus]
 * @prop {number} [maxHit]
 * @prop {number} [damageBonus]
 * @prop {number} [critChance]
 * @prop {number} [critDamage]
 * @prop {number} [castingSpeed]
 * @prop {number} [spellRadius] // TODO: this should be spell data, not a stat
 * @prop {number} [knockback]
 */

/** @type {Object.<string, Unit>} */
export const enemyData = {
  guard: {
    name: "guard",
    type: "enemy",
    url: "/assets/guard.png",
    width: 50,
    height: 110,
    maxAttackers: 10,
    exp: 10,
    stats: {
      maxHP: 15,
      armor: 12,
      attackBonus: 5,
      attackSpeed: 10,
      attackRange: 20,
      maxHit: 4,
      damageBonus: 0,
      moveSpeed: 0.5,
      maxSpeed: 1,
    }
  },
  paladin: {
    name: "paladin",
    type: "enemy",
    url: "/assets/paladin.png",
    width: 60,
    height: 110,
    maxAttackers: 10,
    exp: 15,
    stats: {
      maxHP: 30,
      armor: 16,
      attackBonus: 8,
      attackSpeed: 15,
      attackRange: 30,
      maxHit: 6,
      damageBonus: 1,
      moveSpeed: 0.3,
      maxSpeed: 0.5,
    }
  },
  // doppelsoldner (montante AoE attacks)
  // archer (piercing shot)
}

/** @type {Object.<string, Unit>} */
export const minionData = {
  skeleton: {
    name: "skeleton",
    type: "minion",
    url: "/assets/skele.png",
    width: 40,
    height: 60,
    hideUI: true,
    stats: {
      maxHP: 10,
      armor: 10,
      maxHit: 3,
      attackBonus: 5,
      attackSpeed: 12,
      attackRange: 20,
      damageBonus: 0,
      moveSpeed: 0.5,
      maxSpeed: 1,
    }
  }
}
/** @type {Object.<string, Unit>} */
export const playerData = {
  naked: {
    name: "naked",
    type: "player",
    url: "/assets/necro.png",
    width: 50,
    height: 114,
    stats: {
      maxHP: 50,
      armor: 10,
      moveSpeed: 0.3,
      maxSpeed: 5,
      HPregeneration: 0.5,
      castingSpeed: 0.5,
      spellRadius: 50,
    }

  }
}

export const units = {
  ...enemyData,
  ...minionData,
  ...playerData,
}
