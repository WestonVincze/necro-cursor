import { BehaviorSubject, Subject, map, scan, startWith } from "rxjs";

import { distanceBetweenPoints } from "/src/components/Colliders/isIntersecting";
import { appService, gameState } from "/src/app";
import { items, removeItem } from "/src/components/Drops";
import { createMinion } from "/src/components/Minions";
import { getRandomElements, normalizeForce } from "/src/helpers";
import { RadialSpell } from "/src/components/Spells";
import { LevelUp } from "/src/Views/LevelUp";
import { activeKeys$ } from "/src/components/Inputs";
import { createUnit } from "../Unit";

const FRICTION = 0.05;

const initialLevel = 0;
const initialExperience = 0;

const experienceTable = {
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
}

const getLevelPercentage = (level, experience) => {
  const nextLevel = Math.min(Object.keys(experienceTable).length, level + 1);

  const progress = experience / experienceTable[nextLevel];

  return progress >= 1 ? 100 : Math.floor(progress * 100);
}

const initializePlayer = () => {
  const { app } = appService;
  const player = createUnit("player", "naked", { x: app.screen.width / 2, y: app.screen.height / 2 });

  player.health.subscribeToDeath(() => {
    gameState.transitionToScene("gameOver");
    appService.pause();
  })

  player.health.subscribeToHealthChange(({ type, amount }) => {
    if (type === "damage") {
      gameState.incrementDamageTaken(amount);
    }
    const healthPercent = (player.health.getHP() / player.stats.maxHP) * 100;
    gameState.playerHealthPercent.next(healthPercent)
  })

  const playerLevelSubject = new BehaviorSubject({
    level: initialLevel,
    experience: initialExperience,
  })

  const onLevelUp = new Subject();

  playerLevelSubject
    .pipe(
      scan((acc, curr) => {
        const newExperience = acc.experience + curr.experience;
        const levelUp = getLevelPercentage(acc.level, newExperience) === 100;
        const level = levelUp ? acc.level + 1 : acc.level;
        const experience = levelUp
          ? newExperience - experienceTable[level] 
          : newExperience;
        if (levelUp) {
          onLevelUp.next(level)
        }
        return { level, experience };
      }, { level: initialLevel, experience: initialExperience }),
    )
    .subscribe(({ level, experience }) => {
      const percentage = getLevelPercentage(level, experience);
      gameState.playerExpPercent.next(percentage);
    });

  const addExperience = (experience) => {
    playerLevelSubject.next({ experience });
  }

  const levelUp = () => {
    if (player.level >= experienceTable.length) return;
    addExperience(experienceTable[player.level + 1]);
  }

  const levelUpOptions = [
    {
      name: "Move Speed",
      description: "Increases movement speed.",
      onSelect: () => {
        console.log("MOVE SPEED");
        player.addToStat("moveSpeed", 0.5);
        player.addToStat("maxSpeed", 0.75);
        appService.resume();
      }
    },
    {
      name: "Casting Speed",
      description: "Increases how quickly the summon circle grows.",
      onSelect: () => {
        console.log("CAST SPEED");
        player.addToStat("castingSpeed", 0.5);
        appService.resume();
      }
    },
    {
      name: "Health Regeneration",
      description: "How fast health regenerates over time.",
      onSelect: () => {
        console.log("REGEN");
        player.addToStat("HPregeneration", 0.01);
        appService.resume();
      }
    },
    {
      name: "Max Health",
      description: "The maximum amount of health available.",
      onSelect: () => {
        console.log("MAX HP");
        player.addToStat("maxHP", 15);
        player.health.setMaxHP(player.stats.maxHP);
        appService.resume();
      }
    },
    {
      name: "Spell Size",
      description: "How much area the skeleton summoning circle covers.",
      onSelect: () => {
        console.log("SPELL SIZE");
        player.addToStat("spellRadius", 15);
        appService.resume();
      }
    },
    // TODO: improve stat upgrading system...
    {
      name: "Minion Speed",
      description: "How fast minions can move.",
      onSelect: () => {
        gameState.minions?.[0].addToStat("moveSpeed", 0.1);
        gameState.minions?.[0].addToStat("maxSpeed", 0.3);
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
    }
  ]

  onLevelUp.subscribe((level) => {
    console.log(`Congratulations! You've reached level ${level}!`);
    appService.pause();
    player.level = level;
    LevelUp({
      level,
      options: getRandomElements(levelUpOptions, 3),
    })
  });

  return { ...player, levelUp, addExperience };
}

export const Player = () => {
  const { app, physicsUpdate, world } = appService;
  const player = initializePlayer();
  gameState.player = player;
  const sprite = player.sprite;

  // state
  let [ moveX, moveY ] = [0, 0]
  // TODO: implement a state machine to manage player state
  const handleInput = ({ x, y, summoning }) => {
    if (summoning) {
      if (!player.summoningCircle?.casting) {
        player.summoningCircle = RadialSpell({
          position: sprite,
          maxRadius: player.stats.spellRadius,
          growth: player.stats.castingSpeed,
          onComplete: (radius) => { 
            items.bones?.map(b => {
              if (distanceBetweenPoints(b.sprite, sprite) <= radius + 25) {
                createMinion(b.sprite);
                removeItem("bones", b);
              }
            })
            player.summoningCircle = null
          },
          color: "FFAAFF"
        })
      }
      moveX = 0;
      moveY = 0;
    } else {
      if (player.summoningCircle) {
        player.summoningCircle.resolveSpell();
      }
      moveX = x;
      moveY = y;
    }
  }

  playerInput$.subscribe((e) => handleInput(e))

  // apply x and y state to move player
  physicsUpdate.subscribe((delta) => {
    const { x, y } = normalizeForce({ x: moveX, y: moveY });

    if (x === 0) {
      sprite.vx += -sprite.vx * FRICTION * delta;
    } else {
      sprite.vx += x * player.stats.moveSpeed * delta;
    }

    if (y === 0) {
      sprite.vy += -sprite.vy * FRICTION * delta;
    } else {
      sprite.vy += y * player.stats.moveSpeed * delta;
    }

    // limit max speed
    const magnitude = Math.sqrt(sprite.vx * sprite.vx + sprite.vy * sprite.vy);
    if (magnitude > player.stats.maxSpeed) {
      const scale = player.stats.maxSpeed / magnitude
      sprite.vx *= scale;
      sprite.vy *= scale;
    }

    sprite.x += sprite.vx;
    sprite.y += sprite.vy;

    world.pivot.x = sprite.x;
    world.pivot.y = sprite.y;

    /*
    const position = { x: sprite.x += sprite.vx, y: sprite.y += sprite.vy}

    position.x = Math.min(Math.max(position.x, sprite.width / 2), app.screen.width - sprite.width / 2);
    position.y = Math.min(Math.max(position.y, sprite.height / 2), app.screen.height - sprite.height / 2);
    sprite.x = position.x;
    sprite.y = position.y;
    */
  })
}

// converting input to x/y values
const playerInput$ = activeKeys$.pipe(
  map(keys => ({
    summoning: keys[' '],
    x: (keys['d'] ? 1 : 0) + (keys['a'] ? -1 : 0),
    y: (keys['s'] ? 1 : 0) + (keys['w'] ? -1 : 0),
  })),
  startWith({ x: 0, y: 0}),
)
