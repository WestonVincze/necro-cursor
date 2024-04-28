// @ts-check

/**
 * @typedef {Object} Item
 * @prop {string} name 
 * @prop {string} type 
 * @prop {string} url
 * @prop {number} width
 * @prop {number} height
 */

/** @type {Object.<string, Item>} */
export const itemData = {
  bones: {
    name: 'bones',
    type: 'bones',
    url: '/assets/bones.png',
    width: 50,
    height: 35,
  },
  med_helm: {
    name: 'med_helm',
    type: 'pickups',
    url: '/assets/medHelm.png',
    width: 40,
    height: 40,
  }
}
