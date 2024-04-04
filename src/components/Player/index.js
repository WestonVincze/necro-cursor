import { BehaviorSubject, Subject, map, scan, startWith } from "rxjs";

import { distanceBetweenPoints } from "/src/components/Colliders/isIntersecting";
import { appService, gameState } from "/src/app";
import { bones, removeBones } from "/src/components/Drops";
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
  1: 50,
  2: 110,
  3: 180,
  4: 260,
  5: 350,
  6: 450,
  7: 560,
  8: 680,
  9: 800,
  10: 1000
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

  player.health.subscribeToHealthChange((type, amount) => {
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
      player.level = level;
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
        player.addToStat("HPregeneration", 0.75);
        appService.resume();
      }
    },
    {
      name: "Max Health",
      description: "The maximum amount of health available.",
      onSelect: () => {
        console.log("MAX HP");
        player.addToStat("maxHP", 15);
        health.setMaxHP(player.stats.maxHP);
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
    }
  ]

  onLevelUp.subscribe((level) => {
    console.log(`Congratulations! You've reached level ${level}!`);
    appService.pause();
    LevelUp({
      level,
      options: getRandomElements(levelUpOptions, 3),
    })
  });

  return { ...player, levelUp, addExperience };
}

export const Player = () => {
  const { app, gameTicks$, physicsUpdate } = appService;
  const player = initializePlayer();
  const sprite = player.sprite;

  gameTicks$.subscribe(() => {
    player.health?.heal(player.stats.HPregeneration);
  })

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
            bones.map(b => {
              if (distanceBetweenPoints(b.sprite, sprite) <= radius + 25) {
                createMinion(b.sprite);
                removeBones(b);
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
    const magnitude = (sprite.vx * sprite.vx + sprite.vy * sprite.vy);
    if (magnitude > player.stats.maxSpeed) {
      const scale = player.stats.maxSpeed / magnitude
      sprite.vx *= scale;
      sprite.vy *= scale;
    }

    const position = { x: sprite.x += sprite.vx * delta, y: sprite.y += sprite.vy * delta }

    position.x = Math.min(Math.max(position.x, sprite.width / 2), app.screen.width - sprite.width / 2);
    position.y = Math.min(Math.max(position.y, sprite.height / 2), app.screen.height - sprite.height / 2);
    sprite.x = position.x;
    sprite.y = position.y;
  })

  return player;
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
