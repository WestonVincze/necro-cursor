// @ts-check

/**
 * @typedef {Object} Projectile
 * @prop {string} name 
 * @prop {string} url
 * @prop {number} width
 * @prop {number} height
 * @prop {number} speed
 */

/** @type {Object.<string, Projectile>} */
export const projectiles = {
  arrow: {
    name: "arrow",
    url: "/assets/arrow.png",
    width: 50,
    height: 8,
    speed: 12,
  },
}
