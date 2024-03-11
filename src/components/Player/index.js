import { Container, Sprite } from "pixi.js";
import { BehaviorSubject, Subject, map, scan, startWith } from "rxjs";

import { Health } from "/src/components/Health";
import { distanceBetweenPoints } from "/src/components/Colliders/isIntersecting";
import { appService, setExpBarUI, setHealthBarUI } from "/src/app";
import { killCount } from "/src/components/Enemies";
import { bones, removeBones } from "/src/components/Drops";
import { createMinion } from "/src/components/Minions";
import { GameOver } from "/src/Views/GameOver";
import { getRandomElements, normalizeForce } from "/src/helpers";
import { RadialSpell } from "/src/components/Spells";
import { LevelUp } from "/src/Views/LevelUp";
import { activeKeys$ } from "/src/components/Inputs";

const FRICTION = 0.05;

const initialStats = {
  moveSpeed: 0.3,
  maxSpeed: 5,
  summonSpeed: 0.5,
  summonRadius: 50,
  HPregeneration: 0.5,
  maxHP: 100,
}

let summons = 0;

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
  const { app, spriteContainer } = appService;
  const sprite = Sprite.from("assets/necro.png");
  sprite.width = 50;
  sprite.height = 114;
  sprite.anchor.set(0.5);

  const container = new Container();
  container.position.set(app.screen.width / 2, app.screen.height / 2);
  container.vx = 0;
  container.vy = 0;

  container.addChild(sprite);
  spriteContainer.addChild(container);

  const _stats = initialStats;

  const health = Health({ maxHP: _stats.maxHP, container });

  health.subscribeToDeath(() => {
    GameOver({ killCount, armySize: summons });
    appService.pause();
  })

  health.subscribeToHealthChange(() => {
    const healthPercent = (player.health.getHP() / _stats.maxHP) * 100;
    setHealthBarUI(healthPercent);
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
      if (!setExpBarUI) return;
      setExpBarUI(percentage);
    });

  const addExperience = (experience) => {
    playerLevelSubject.next({ experience });
  }

  const getStat = (stat) => _stats[stat];

  const setStat = (stat, value) => {
    if (_stats.hasOwnProperty(stat)) {
      _stats[stat] = value;
    } else {
      console.error(`Invalid stat: ${stat}`);
    }
  }

  const addToStat = (stat, value) => {
    if (_stats.hasOwnProperty(stat)) {
      _stats[stat] += value;
    } else {
      console.error(`Invalid stat: ${stat}`);
    }
  }

  const levelUpOptions = [
    {
      name: "Move Speed",
      description: "Increases movement speed.",
      onSelect: () => {
        console.log("MOVE SPEED");
        _stats.moveSpeed += 0.05;
        _stats.maxSpeed += 0.75;
        appService.resume();
      }
    },
    {
      name: "Casting Speed",
      description: "Increases how quickly the summon circle grows.",
      onSelect: () => {
        console.log("CAST SPEED");
        _stats.summonSpeed += 0.5;
        appService.resume();
      }
    },
    {
      name: "Health Regeneration",
      description: "How fast health regenerates over time.",
      onSelect: () => {
        console.log("REGEN");
        _stats.HPregeneration += 0.75; 
        appService.resume();
      }
    },
    {
      name: "Max Health",
      description: "The maximum amount of health available.",
      onSelect: () => {
        console.log("MAX HP");
        _stats.maxHP += 15; 
        health.setMaxHP(_stats.maxHP);
        appService.resume();
      }
    },
    {
      name: "Spell Size",
      description: "How much area the skeleton summoning circle covers.",
      onSelect: () => {
        console.log("SPELL SIZE");
        _stats.summonRadius += 15; 
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

  const player = {
    sprite: container,
    attackers: [],
    summoningCircle: null,
    health,
    addExperience,
    onLevelUp,
    _stats,
    getStat,
    setStat,
    addToStat,
  }
  
  return player;
}

export const Player = () => {
  const { app, gameTicks$ } = appService;
  const player = initializePlayer();
  const sprite = player.sprite;


  gameTicks$.subscribe(() => {
    player.health.heal(player._stats.HPregeneration)
  })

  // state
  let [ moveX, moveY ] = [0, 0]
  // TODO: implement a state machine to manage player state
  const handleInput = ({ x, y, summoning }) => {
    if (summoning) {
      if (!player.summoningCircle?.casting) {
        player.summoningCircle = RadialSpell({
          position: sprite,
          maxRadius: player._stats.summonRadius,
          growth: player._stats.summonSpeed,
          onComplete: (radius) => { 
            bones.map(b => {
              if (distanceBetweenPoints(b.sprite, sprite) <= radius + 25) {
                summons++;
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
      if (player.summoningCircle !== null) {
        player.summoningCircle.resolveSpell();
      }
      moveX = x;
      moveY = y;
    }
  }

  playerInput$.subscribe((e) => handleInput(e))

  // apply x and y state to move player
  app.ticker.add((delta) => {
    const { x, y } = normalizeForce({ x: moveX, y: moveY });

    if (x === 0) {
      sprite.vx += -sprite.vx * FRICTION * delta;
    } else {
      sprite.vx += x * player._stats.moveSpeed * delta;
    }

    if (y === 0) {
      sprite.vy += -sprite.vy * FRICTION * delta;
    } else {
      sprite.vy += y * player._stats.moveSpeed * delta;
    }

    // limit max speed
    const magnitude = (sprite.vx * sprite.vx + sprite.vy * sprite.vy);
    if (magnitude > player._stats.maxSpeed) {
      const scale = player._stats.maxSpeed / magnitude
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
