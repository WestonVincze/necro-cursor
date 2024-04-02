// @ts-check

// TODO: change current "type" values to "name" and change "type" to be "enemy | minion | player"
/**
 * @typedef {Object} Unit 
 * @prop {string} type
 * @prop {string} url
 * @prop {number} width
 * @prop {number} height
 * @prop {number} maxHP
 * @prop {number} [exp]
 * @prop {boolean} [hideUI]
 * @prop {number} [maxAttackers]
 * @prop {number} [attackSpeed]
 * @prop {number} [attackRange]
 * @prop {number} [damage]
 * @prop {number} [critChance]
 * @prop {number} [critDamage]
 * @prop {number} [knockback]
 * @prop {number} [accuracy] ??
 * @prop {function} [behavior] - defines the "brain"
 */

/** @type {Object.<string, Unit>} */
export const enemyData = {
  guard: {
    type: "guard",
    url: "/assets/guard.png",
    width: 50,
    height: 110,
    maxHP: 100,
    maxAttackers: 10,
    exp: 10,
    attackSpeed: 3,
    attackRange: 0,
    damage: 1,
  },
  paladin: {
    type: "paladin",
    url: "/assets/paladin.png",
    width: 60,
    height: 110,
    maxHP: 150,
    maxAttackers: 10,
    exp: 15,
    attackSpeed: 3,
    attackRange: 0,
    damage: 1,
  },
  // doppelsoldner (montante AoE attacks)
  // archer (piercing shot)
}

/** @type {Object.<string, Unit>} */
export const minionData = {
  skeleton: {
    type: "skeleton",
    url: "/assets/skele.png",
    width: 40,
    height: 60,
    maxHP: 1,
    hideUI: true,
    attackSpeed: 3,
    attackRange: 0,
    damage: 1,
  }
}
