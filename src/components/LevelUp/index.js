import { appService, gameState } from "../../app";


// TODO: fix bug where adding minion stats while having no minions breaks game

export const levelUpOptions = [
  // Player
  {
    name: "Move Speed",
    description: "Increases how fast you can move.",
    onSelect: () => {
      gameState.player.addToStat("moveSpeed", 0.1);
      gameState.player.addToStat("maxSpeed", 0.3);
      appService.resume();
    }
  },
  {
    name: "Summoning Spell",
    description: "Increases how quickly your summoning circle grows and how much area it covers.",
    onSelect: () => {
      gameState.player.addToStat("castingSpeed", 0.2);
      gameState.player.addToStat("spellRadius", 15);
      appService.resume();
    }
  },
  {
    name: "Health Regeneration",
    description: "How fast your health regenerates over time.",
    onSelect: () => {
      gameState.player.addToStat("HPregeneration", 0.01);
      appService.resume();
    }
  },
  {
    name: "Max Health",
    description: "The maximum amount of health you can have.",
    onSelect: () => {
      gameState.player.addToStat("maxHP", 10);
      gameState.player.health.setMaxHP(gameState.player.stats.maxHP);
      gameState.player.health.heal(10);
      appService.resume();
    }
  },
  {
    name: "Armor",
    description: "Reduces the chance you get hit by attacks.",
    onSelect: () => {
      gameState.player.addToStat("armor", 1);
      appService.resume();
    },
  },
  // MINIONS
  {
    name: "Minion Speed",
    description: "How fast minions can move.",
    onSelect: () => {
      gameState.minions?.[0].addToStat("moveSpeed", 0.15);
      gameState.minions?.[0].addToStat("maxSpeed", 0.4);
      appService.resume();
    }
  },
  {
    name: "Minion Max Hit",
    description: "The maximum damage of your minions.",
    onSelect: () => {
      gameState.minions?.[0].addToStat("maxHit", 1);
      appService.resume();
    }
  },
  {
    name: "Minion Armor",
    description: "How difficult minions are to hit.",
    onSelect: () => {
      gameState.minions?.[0].addToStat("armor", 1);
      appService.resume();
    }
  },
  {
    name: "Minion Accuracy",
    description: "How likely a minion is to hit.",
    onSelect: () => {
      gameState.minions[0].addToStat("attackBonus", 1);
      appService.resume();
    }
  },
  {
    name: "Minion MaxHP",
    description: "The max HP of your minions.",
    onSelect: () => {
      gameState.minions[0].addToStat("maxHP", 5);
      gameState.minions.forEach(m => {
        m.health.setMaxHP(m.stats.maxHP);
        m.health.heal(5);
      })
      appService.resume();
    }
  },
  {
    name: "Minion Crit Chance",
    description: "The chance a minion's attack has to crit.",
    onSelect: () => {
      gameState.minions[0].addToStat("critChance", 5);
      appService.resume();
    }
  },
  {
    name: "Minion Crit Damage",
    description: "The effectiveness of a minion's critical hits.",
    onSelect: () => {
      gameState.minions[0].addToStat("critDamage", 0.5);
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
