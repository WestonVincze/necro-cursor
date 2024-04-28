import { appService } from "../../app";
import { addToStat, setStat } from "../../data/units";

// TODO: fix bug where adding minion stats while having no minions does nothing
export const levelUpOptions = (gameState) => [
  // Player
  {
    name: "Move Speed",
    description: `Increases your max speed by 0.3.`,
    currentStats: `Max Speed: ${gameState.player.stats.maxSpeed}`,
    onSelect: () => {
      gameState.player.addToStat("moveSpeed", 0.1);
      gameState.player.addToStat("maxSpeed", 0.3);
      appService.resume();
    }
  },
  {
    name: "Summoning Spell",
    description: "Increases how quickly your summoning circle grows its radius by 15.",
    currentStats: `Radius: ${gameState.player.stats.spellRadius}`,
    onSelect: () => {
      gameState.player.addToStat("castingSpeed", 0.2);
      gameState.player.addToStat("spellRadius", 15);
      appService.resume();
    }
  },
  {
    name: "Health Regeneration",
    description: "Increases your health regeneration by 0.05 / s.",
    currentStats: `Regeneration: ${(gameState.player.stats.HPregeneration * 5).toFixed(2)} / s`,
    onSelect: () => {
      gameState.player.addToStat("HPregeneration", 0.01);
      appService.resume();
    }
  },
  {
    name: "Max Health",
    description: "Increases your max health by 10.",
    currentStats: `Max HP: ${gameState.player.stats.maxHP}`,
    onSelect: () => {
      gameState.player.addToStat("maxHP", 10);
      gameState.player.health.setMaxHP(gameState.player.stats.maxHP);
      gameState.player.health.heal(10);
      appService.resume();
    }
  },
  {
    name: "Armor",
    description: "Increases your armor by 1.",
    currentStats: `Armor: ${gameState.player.stats.armor}`,
    onSelect: () => {
      gameState.player.addToStat("armor", 1);
      appService.resume();
    },
  },
  // MINIONS
  {
    name: "Minion Speed",
    description: "Increases minion movement speed by 0.4.",
    currentStats: `Minion Max Speed: ${gameState.minions?.[0]?.stats.maxSpeed}`,
    onSelect: () => {
      addToStat("skeleton", "moveSpeed", 0.15);
      addToStat("skeleton", "maxSpeed", 0.4);
      appService.resume();
    }
  },
  {
    name: "Minion Max Hit",
    description: "Increases the max hit of your minions by 1.",
    currentStats: `Minion Max Hit: ${gameState.minions?.[0]?.stats.maxHit}`,
    onSelect: () => {
      addToStat("skeleton", "maxHit", 1);
      appService.resume();
    }
  },
  {
    name: "Minion Armor",
    description: "Increases minion armor by 1.",
    currentStats: `Minion Armor: ${gameState.minions?.[0]?.stats.armor}`,
    onSelect: () => {
      addToStat("skeleton", "armor", 1);
      appService.resume();
    }
  },
  {
    name: "Minion Accuracy",
    description: "Increases minion accuracy by 1.",
    currentStats: `Minion Accuracy: ${gameState.minions?.[0]?.stats.attackBonus}`,
    onSelect: () => {
      addToStat("skeleton", "attackBonus", 1);
      appService.resume();
    }
  },
  {
    name: "Minion MaxHP",
    description: "Increases max HP of your minions by 5.",
    currentStats: `Minion MaxHP: ${gameState.minions?.[0]?.stats.maxHP}`,
    onSelect: () => {
      addToStat("skeleton", "maxHP", 5);
      gameState.minions.forEach(m => {
        m.health.setMaxHP(m.stats.maxHP);
        m.health.heal(5);
      })
      appService.resume();
    }
  },
  {
    name: "Minion Crit Chance",
    description: "Increases your minion's crit chance by 5%.",
    currentStats: `Minion Crit Chance: ${gameState.minions?.[0]?.stats.critChance}%`,
    onSelect: () => {
      addToStat("skeleton", "critChance", 5);
      appService.resume();
    }
  },
  {
    name: "Minion Crit Damage",
    description: "Increases multiplier of your minion's critical hits by 0.5x.",
    currentStats: `Minion Crit Damage: ${gameState.minions?.[0]?.stats.critDamage}x`,
    onSelect: () => {
      addToStat("skeleton", "critDamage", 0.5);
      appService.resume();
    }
  },
]

const levelUpOption = () => {
  // decide on random attribute to increase
  // decide on random attribute to decrease OR random enemy attribute to increase?
  // decide on percent to increase
  // decide on percent to decrease

  // sometimes upgrades are bad?
  // update stats for LIVING vs FUTURE minions?
  // sacrifice minions to re-roll?
}

const createExperienceTable = () => {
  const table = { 1: 35 };
  for (let i = 2; i < 50; i++) {
    table[i] = table[i - 1] + 10;
  }

  return table;
}

export const experienceTable = createExperienceTable();

/*
export const experienceTable = {
  1: 35,
  2: 75,
  3: 120,
  4: 170,
  5: 225,
  6: 285,
  7: 350,
  8: 420,
  9: 495,
  10: 575,
  11: 660,
  12: 750,
  13: 845,
  14: 945,
  15: 1050,
  16: 1160,
  17: 1275,
  18: 1395,
  19: 1520,
  20: 1650,
  21: 1650,
  22: 1650,
  23: 1650,
  24: 1650,
  25: 1650,
  26: 1650,
  27: 1650,
  28: 1650,
  29: 1650,
  30: 1650,
}
*/
