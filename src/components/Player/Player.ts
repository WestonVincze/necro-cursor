import { BehaviorSubject, Subject, map, scan, startWith } from "rxjs";

import { LevelUp } from "../../Views/LevelUp";
import { levelUpOptions, experienceTable } from "../LevelUp";
import { distanceBetweenPoints } from "../Colliders";
import { appService, gameState } from "../../app";
import { removeItem } from "../Drops";
import { createMinion } from "../Minions";
import { getRandomElements, normalizeForce, getClosestUnit } from "../../helpers";
import { RadialSpell, RectangularSpell, CastBar } from "../Spells";
import { activeKeys$, keyDown$ } from "../Inputs";
import { createUnit, Unit } from "../Unit";

interface Player extends Unit {
  selectedSpell?: string,
}

const FRICTION = 0.05;

const initialLevel = 0;
const initialExperience = 0;

const getNextLevelExp = (level) => {
  const nextLevel = Math.min(Object.keys(experienceTable).length, level + 1);
  return experienceTable[nextLevel];
}

const initializePlayer = () => {
  const { app } = appService;
  const player: Player = createUnit("player", "naked", { x: app.screen.width / 2, y: app.screen.height / 2 });
  gameState.player = player;

  gameState.playerHealth.next({ current: player.health.getHP(), max: player.getStats().maxHP });

  player.health.subscribeToDeath(() => {
    gameState.transitionToScene("gameOver");
    appService.pause();
  })

  player.health.subscribeToHealthChange(({ type, amount }) => {
    if (type === "damage") {
      gameState.incrementDamageTaken(amount);
    }
    gameState.playerHealth.next({ current: player.health.getHP(), max: player.getStats().maxHP });
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
        const expToNextLevel = getNextLevelExp(acc.level)
        const levelUp = newExperience >= expToNextLevel;
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
      gameState.playerExpPercent.next({ current: experience, nextLevel: getNextLevelExp(level) });
    });

  const addExperience = (experience) => {
    playerLevelSubject.next({ experience, level: 0 });
  }

  const levelUp = () => {
    if (player.level >= Object.keys(experienceTable).length) return;
    addExperience(experienceTable[player.level + 1]);
  }

  onLevelUp.subscribe((level: number) => {
    console.log(`Congratulations! You've reached level ${level}!`);
    appService.pause();
    player.level = level;
    LevelUp({
      level,
      options: getRandomElements(levelUpOptions(gameState), 3),
    })
  });

  player.selectedSpell = "summon";

  return { ...player, levelUp, addExperience };
}

const spells = {
  sacrifice: (sprite) => {
    const sacrificialLamb = getClosestUnit(sprite, gameState.minions);
    if (sacrificialLamb) {
      sacrificialLamb.health.kill();
      gameState.minions.forEach(minion => minion.health.heal(5));
      console.log("MURDERED")
    } else {
      console.log("NO LAMB FOUND")
    }
  },
}

export const Player = () => {
  const { physicsUpdate, world } = appService;
  gameState.player = initializePlayer();
  const { player } = gameState;

  const sprite = player.sprite;

  keyDown$.subscribe((keydown) => {
    if (keydown.key === '1') player.selectedSpell = "summon";
    if (keydown.key === '2') player.selectedSpell = "sacrifice";
  })

  // state
  let [ moveX, moveY ] = [0, 0]
  // TODO: implement a state machine to manage player state
  const handleInput = ({ x, y, casting }) => {
    // forbid player actions while paused
    if (appService.paused) return;

    if (casting) {
      if (!player.castingSpell?.casting) {
        if (player.selectedSpell === "summon") {
          const offset = { x: 0, y: sprite.height / 2 }
          player.castingSpell = RadialSpell({
            position: sprite,
            offset,
            endSize: player.getStats().spellRadius,
            growth: player.getStats().castingSpeed,
            canBeHeld: true,
            onComplete: () => { 
              player.castingSpell = null
            },
            successCondition: (radius) => radius > 25,
            onSuccess: (radius) => {
              gameState.items.bones?.map(b => {
                if (distanceBetweenPoints(b.sprite, { x: sprite.x, y: sprite.y + offset.y }) <= radius + b.sprite.width / 2) {
                  createMinion(b.sprite);
                  removeItem("bones", b);
                }
              })
            },
            color: "FFAAFF",
          })
        } else {
          player.castingSpell = CastBar({
            sprite,
            onComplete: () => {
              console.log("DONE");
              player.castingSpell = null;
            },
            onSuccess: () => {
              console.log("CAST SPELL");
              spells[player.selectedSpell](sprite);
            },
            castTime: 1,
          })
        }
        /*
        player.castingSpell = RectangularSpell({
          position: sprite,
          maxWidth: 100,
          growth: 0.5,
          canBeHeld: true,
          onComplete: (width) => {
            console.log("COMPLETED SPELL: " + width);
            player.vx += 50;
            player.castingSpell = null;
          },
          target: items.bones[0].sprite,
        })
        */
      }
      moveX = 0;
      moveY = 0;
    } else {
      if (player.castingSpell) {
        player.castingSpell.resolveSpell();
      }
      moveX = x;
      moveY = y;
    }
  }

  playerInput$.subscribe((e: { x: number, y: number, casting: boolean }) => handleInput(e))

  // apply x and y state to move player
  physicsUpdate.subscribe((delta) => {
    const { x, y } = normalizeForce({ x: moveX, y: moveY });

    if (x === 0) {
      sprite.vx += -sprite.vx * FRICTION * delta;
    } else {
      sprite.vx += x * player.getStats().moveSpeed * delta;
    }

    if (y === 0) {
      sprite.vy += -sprite.vy * FRICTION * delta;
    } else {
      sprite.vy += y * player.getStats().moveSpeed * delta;
    }

    // limit max speed
    const magnitude = Math.sqrt(sprite.vx * sprite.vx + sprite.vy * sprite.vy);
    if (magnitude > player.getStats().maxSpeed) {
      const scale = player.getStats().maxSpeed / magnitude
      sprite.vx *= scale;
      sprite.vy *= scale;
    }

    sprite.x += sprite.vx;
    sprite.y += sprite.vy;

    world.pivot.x = sprite.x;
    world.pivot.y = sprite.y;
  })
}

// converting input to x/y values
const playerInput$ = activeKeys$.pipe(
  map(keys => ({
    casting: keys[' '],
    x: (keys['d'] ? 1 : 0) + (keys['a'] ? -1 : 0),
    y: (keys['s'] ? 1 : 0) + (keys['w'] ? -1 : 0),
  })),
  startWith({ x: 0, y: 0}),
)
