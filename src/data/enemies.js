// @ts-check

/**
 * @typedef {Object} Enemy
 * @prop {string} url
 * @prop {number} width
 * @prop {number} height
 */

/** @type {Object.<string, Enemy>} */
const enemies = {
  guard: {
    url: "/guard.png",
    width: 50,
    height: 110,
  },
  paladin: {
    url: "/paladin.png",
    width: 60,
    height: 110,
  },
}
