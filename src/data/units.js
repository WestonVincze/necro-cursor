// @ts-check

// TODO: change current "type" values to "name" and change "type" to be "enemy | minion | player"
/**
 * @typedef {Object} Unit 
 * @prop {string} name 
 * @prop {string} type
 * @prop {string} url
 * @prop {number} width
 * @prop {number} height
 * @prop {number} maxHP // remove this
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
    maxHP: 100,
    maxAttackers: 10,
    exp: 10,
    stats: {
      maxHP: 20,
      armor: 12,
      attackSpeed: 3,
      attackRange: 0,
      maxHit: 4,
      damageBonus: 0,
    }
  },
  paladin: {
    name: "paladin",
    type: "enemy",
    url: "/assets/paladin.png",
    width: 60,
    height: 110,
    maxHP: 150,
    maxAttackers: 10,
    exp: 15,
    stats: {
      maxHP: 30,
      armor: 16,
      attackSpeed: 3,
      attackRange: 0,
      maxHit: 4,
      damageBonus: 1,
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
    maxHP: 1,
    hideUI: true,
    stats: {
      maxHP: 10,
      armor: 10,
      maxHit: 4,
      attackSpeed: 4,
      attackRange: 50,
      damageBonus: 0,
    }
  }
}

export const units = {
  ...enemyData,
  ...minionData,
}
