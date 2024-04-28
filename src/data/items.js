// @ts-check

/**
 * @typedef {Object} Item
 * @prop {string} name 
 * @prop {string} url
 * @prop {number} width
 * @prop {number} height
 * @prop {boolean} [isPickup]
 */

/** @type {Object.<string, Item>} */
export const itemData = {
  bones: {
    name: 'bones',
    url: '/assets/bones.png',
    width: 50,
    height: 35,
  },
  helmet: {
    name: 'helmet',
    url: '',
    width: 50,
    height: 35,
  }
}
