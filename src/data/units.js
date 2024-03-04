// @ts-check

/**
 * @typedef {Object} Unit 
 * @prop {string} type
 * @prop {string} url
 * @prop {number} width
 * @prop {number} height
 * @prop {number} maxHP
 * @prop {boolean} [hideHP]
 * @prop {number} [maxAttackers]
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
  },
  paladin: {
    type: "paladin",
    url: "/assets/paladin.png",
    width: 60,
    height: 110,
    maxHP: 150,
    maxAttackers: 10,
  },
}

/** @type {Object.<string, Unit>} */
export const minionData = {
  skeleton: {
    type: "skeleton",
    url: "/assets/skele.png",
    width: 40,
    height: 60,
    maxHP: 1,
    hideHP: true,
  }
}
