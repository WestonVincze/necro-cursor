import { BehaviorSubject, Subject, map, scan, startWith } from "rxjs";

import { levelUpOptions, experienceTable } from "../LevelUp";
import { distanceBetweenPoints } from "/src/components/Colliders/isIntersecting";
import { appService, gameState } from "/src/app";
import { items, removeItem } from "/src/components/Drops";
import { createMinion } from "/src/components/Minions";
import { getRandomElements, normalizeForce } from "/src/helpers";
import { RadialSpell, RectangularSpell } from "/src/components/Spells";
import { LevelUp } from "/src/Views/LevelUp";
import { activeKeys$ } from "/src/components/Inputs";
import { createUnit } from "../Unit";

const FRICTION = 0.05;

const initialLevel = 0;
const initialExperience = 0;

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
  const { physicsUpdate, world } = appService;
  const player = initializePlayer();
  gameState.player = player;
  const sprite = player.sprite;

  // state
  let [ moveX, moveY ] = [0, 0]
  // TODO: implement a state machine to manage player state
  const handleInput = ({ x, y, summoning }) => {
    if (summoning) {
      if (!player.summoningCircle?.casting) {
        /*
        player.summoningCircle = RectangularSpell({
          position: sprite,
          maxWidth: 100,
          growth: 0.5,
          canBeHeld: true,
          onComplete: (width) => {
            console.log("COMPLETED SPELL: " + width);
            player.vx += 50;
            player.summoningCircle = null;
          },
          target: items.bones[0].sprite,
        })
        */
        player.summoningCircle = RadialSpell({
          position: sprite,
          endRadius: player.stats.spellRadius,
          growth: player.stats.castingSpeed,
          canBeHeld: true,
          onComplete: (radius) => { 
            items.bones?.map(b => {
              if (distanceBetweenPoints(b.sprite, sprite) <= radius + b.sprite.width / 2) {
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
