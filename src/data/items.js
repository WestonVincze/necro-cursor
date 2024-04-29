// @ts-check

/**
 * @typedef {Object} Item
 * @prop {string} name 
 * @prop {string} type 
 * @prop {string} url
 * @prop {number} width
 * @prop {number} height
 * @prop {Object[]} [stats]
 * @prop {string} stats.name
 * @prop {number} stats.value
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
    url: '/assets/med_helm.png',
    width: 40,
    height: 40,
    stats: [
      {
        name: "armor",
        value: 2
      }
    ]
  },
  bucket_helm: {
    name: 'bucket_helm',
    type: 'pickups',
    url: '/assets/bucket_helm.png',
    width: 40,
    height: 40,
    stats: [
      {
        name: "armor",
        value: 4,
      }
    ]
  },
  great_sword: {
    name: 'great_sword',
    type: 'pickups',
    url: '/assets/great_sword.png',
    width: 120,
    height: 40, 
    stats: [
      {
        name: "attackBonus",
        value: 5,
      },
      {
        name: "maxHit",
        value: 10,
      },
      {
        name: "attackRange",
        value: 40,
      },
      {
        name: "attackSpeed",
        value: 3,
      }
    ]
  },
  crossbow: {
    name: 'crossbow',
    type: 'pickups',
    url: '/assets/crossbow.png',
    width: 40,
    height: 40,
    stats: [
      {
        name: "attackRange",
        value: 200,
      },
      {
        name: "attackSpeed",
        value: 15,
      },
      {
        name: "maxHit",
        value: 3,
      },
      {
        name: "attackBonus",
        value: 3
      }
    ]
  }
}
