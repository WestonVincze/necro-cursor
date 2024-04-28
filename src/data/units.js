// @ts-check

/**
 * @typedef {Object} Unit 
 * @prop {string} name 
 * @prop {string} type
 * @prop {string} url
 * @prop {number} width
 * @prop {number} height
 * @prop {Stats} stats
 * @prop {boolean} [ranged]
 * @prop {DropTable} [dropTable]
 * @prop {number} [exp] // change to expReward?
 * @prop {boolean} [hideUI]
 * @prop {function} [behavior] - defines the "brain"
 */

/**
 * @typedef {Object} DropTable
 * @prop {string[]} [always]
 * @prop {string[]} [common]
 * @prop {string[]} [rare]
 * @prop {string[]} [legendary]
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
 * @prop {number} [maxAttackers] // remove this?
 * @prop {number} [knockback]
 */

/** @type {Object.<string, Unit>} */
export const enemyData = {
  peasant: {
    name: "peasant",
    type: "enemy",
    url: "/assets/peasant.png",
    width: 45,
    height: 110,
    exp: 8,
    stats: {
      maxHP: 5,
      armor: 8,
      attackBonus: 2,
      attackSpeed: 8,
      attackRange: 20,
      maxHit: 1,
      damageBonus: 0,
      moveSpeed: 0.35,
      maxSpeed: 1.2,
      maxAttackers: 10,
    },
    dropTable: {
      always: ["bones"]
    }
  },
  guard: {
    name: "guard",
    type: "enemy",
    url: "/assets/guard.png",
    width: 50,
    height: 110,
    exp: 12,
    stats: {
      maxHP: 15,
      armor: 12,
      attackBonus: 6,
      attackSpeed: 4,
      attackRange: 20,
      maxHit: 4,
      damageBonus: 0,
      moveSpeed: 0.3,
      maxSpeed: 1,
      maxAttackers: 10,
      critChance: 5,
      critDamage: 2,
    },
    dropTable: {
      always: ["bones", "med_helm"],
      // rare: ["med_helm"]
    }
  },
  paladin: {
    name: "paladin",
    type: "enemy",
    url: "/assets/paladin.png",
    width: 60,
    height: 110,
    exp: 25,
    stats: {
      maxHP: 30,
      armor: 16,
      attackBonus: 8,
      attackSpeed: 8,
      attackRange: 30,
      maxHit: 6,
      damageBonus: 1,
      moveSpeed: 0.2,
      maxSpeed: 0.5,
      maxAttackers: 10,
      critChance: 5,
      critDamage: 2,
    },
    dropTable: {
      always: ["bones"]
    }
  },
  doppelsoldner: {
    name: "doppelsoldner",
    type: "enemy",
    url: "/assets/doppelsoldner.png",
    width: 60,
    height: 120,
    exp: 30,
    stats: {
      maxHP: 40,
      armor: 14,
      attackBonus: 10,
      attackSpeed: 8,
      attackRange: 60,
      maxHit: 12,
      damageBonus: 3,
      moveSpeed: 0.5,
      maxSpeed: 1.2,
      maxAttackers: 10,
      critChance: 25,
      critDamage: 2,
    },
    dropTable: {
      always: ["bones"],
    }
  },
  archer: {
    name: "archer",
    type: "enemy",
    url: "/assets/archer.png",
    width: 60,
    height: 110,
    exp: 30,
    ranged: true,
    stats: {
      maxHP: 30,
      armor: 16,
      maxAttackers: 10,
      moveSpeed: 0.6,
      maxSpeed: 1.3,
      critChance: 25,
      critDamage: 2,
      attackRange: 300,
      attackBonus: 5,
      attackSpeed: 20,
      damageBonus: 1,
      maxHit: 8,
    },
    dropTable: {
      always: ["bones"],
    }
  }
}

/** @type {Object.<string, Unit>} */
export const minionData = {
  skeleton: {
    name: "skeleton",
    type: "minion",
    url: "/assets/skele.png",
    width: 40,
    height: 60,
    stats: {
      maxHP: 8,
      armor: 8,
      maxHit: 2,
      attackBonus: 4,
      attackSpeed: 5,
      attackRange: 20,
      damageBonus: 0,
      moveSpeed: 0.2,
      maxSpeed: 1.5,
      critChance: 5,
      critDamage: 1.5,
    },
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
      maxHP: 20,
      armor: 10,
      moveSpeed: 0.2,
      maxSpeed: 2,
      HPregeneration: 0.05,
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

// TODO: where should this stat modifying logic actually go?
const checkForStat = (unit, stat) => {
  if (!units[unit].stats.hasOwnProperty(stat)) {
    console.error(`Stat ${stat} not found on unit ${unit}.`);
    return false;
  }

  return true;
}

export const setStat = (unit, stat, value) => {
  if (!checkForStat(unit, stat)) return;

  units[unit].stats[stat] = value;
}

export const addToStat = (unit, stat, value) => {
  if (!checkForStat(unit, stat)) return;

  const newValue = units[unit].stats[stat] + value;
  units[unit].stats[stat] = Math.round(newValue * 100) / 100;
}
