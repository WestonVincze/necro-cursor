import { Container, Sprite } from "pixi.js";
import { BehaviorSubject, Observable, Subject, distinctUntilChanged, filter, fromEvent, map, merge, scan, startWith } from "rxjs";
import { Health } from "../Health";
import { distanceBetweenPoints } from "../Colliders/isIntersecting";
import { appService } from "../app";
import { killCount } from "../Enemies";
import { bones, removeBones } from "../Drops";
import { createMinion } from "../Minions";
import { GameOver } from "../Views/GameOver";
import { normalizeForce } from "../helpers";
import { RadialSpell } from "../Spells";
import { LevelUp } from "../Views/LevelUp";

const FRICTION = 0.05;

const initialLevel = 0;
const initialExperience = 0;

/*
const experienceTable = {
  1: 100,
  2: 210,
  3: 350,
  4: 600,
  5: 1000,
  6: 1500,
  7: 2500,
  8: 4000,
  9: 6500,
  10: 10000
}
*/

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

const playerLevelSubject = new BehaviorSubject({
  level: initialLevel,
  experience: initialExperience,
})

export const addExperience = (experience) => {
  playerLevelSubject.next({ experience });
}

export const onLevelUp = new Subject();

playerLevelSubject
  .pipe(
    scan((acc, curr) => {
      const newExperience = acc.experience + curr.experience;
      const levelUp = newExperience >= experienceTable[acc.level + 1]
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
  .subscribe()

let summons = 0;

const initializePlayer = () => {
  const { app, spriteContainer } = appService;
  const sprite = Sprite.from("assets/necro.png");
  sprite.width = 50;
  sprite.height = 114;
  sprite.anchor.set(0.5)

  const container = new Container();
  container.position.set(app.screen.width / 2, app.screen.height / 2);
  container.vx = 0;
  container.vy = 0;

  container.addChild(sprite);
  spriteContainer.addChild(container);

  const health = Health({ maxHP: 150, container });

  health.subscribeToDeath(() => {
    GameOver({ killCount, armySize: summons });
    app.ticker.stop();
  })

  const player = {
    sprite: container,
    attackers: [],
    summoningCircle: null,
    health,
  }
  
  return player;
}

export const Player = () => {
  const { app, gameTicks$ } = appService;
  const player = initializePlayer();
  const sprite = player.sprite;

  const stats = {
    moveSpeed: 0.3,
    maxSpeed: 5,
    summonSpeed: 0.5,
    summonRadius: 150,
    HPregeneration: 0.5,
    maxHP: 150,
  }

  player.getStat = (stat) => stats[stat];

  player.setStat = (stat, value) => {
    if (stats.hasOwnProperty(stat)) {
      stats[stat] = value;
    } else {
      console.error(`Invalid stat: ${stat}`);
    }
  }

  onLevelUp.subscribe((level) => {
    console.log(`Congratulations! You've reached level ${level}!`);
    appService.pause();
    /**
     * TODO: randomly provide options for leveling up
     */
    LevelUp({
      level,
      options: [
        {
          name: "SPEED",
          description: "Increases movement speed.",
          onSelect: () => {
            console.log("speed");
            stats.moveSpeed += 0.05;
            stats.maxSpeed += 0.75;
            appService.resume();
          }
        },
        {
          name: "SUMMON SPEED",
          description: "Increases how quickly the summon circle grows.",
          onSelect: () => {
            console.log("summonSpeed");
            stats.summonSpeed += 0.5;
            appService.resume();
          }
        },
        {
          name: "HPRegeneration",
          description: "Health Regeneration",
          onSelect: () => {
            console.log("REGEN");
            stats.HPregeneration += 0.75; 
            app.ticker.start();
          }
        }
      ]
    })
  });

  gameTicks$.subscribe(() => {
    player.health.heal(stats.HPregeneration)
  })

  // state
  let [ moveX, moveY ] = [0, 0]
  // TODO: implement a state machine to manage player state
  const handleInput = ({ x, y, summoning }) => {
    if (summoning) {
      if (!player.summoningCircle?.casting) {
        player.summoningCircle = RadialSpell({
          position: sprite,
          maxRadius: stats.summonRadius,
          growth: stats.summonSpeed,
          onComplete: (radius) => { 
            bones.map(b => {
              if (distanceBetweenPoints(b.sprite, sprite) <= radius) {
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
      sprite.vx += x * stats.moveSpeed * delta;
    }

    if (y === 0) {
      sprite.vy += -sprite.vy * FRICTION * delta;
    } else {
      sprite.vy += y * stats.moveSpeed * delta;
    }

    // limit max speed
    const magnitude = (sprite.vx * sprite.vx + sprite.vy * sprite.vy);
    if (magnitude > stats.maxSpeed) {
      const scale = stats.maxSpeed / magnitude
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

// player input and observables
const inputs = ['w', 'a', 's', 'd', ' '];

const keyDown$ = fromEvent(document, 'keydown').pipe(
  filter(e => inputs.includes(e.key.toLowerCase())),
  map(e => ({
    key: e.key.toLowerCase(),
    isDown: true,
  }))
)

const keyUp$ = fromEvent(document, 'keyup').pipe(
  filter(e => inputs.includes(e.key.toLowerCase())),
  map(e => ({
    key: e.key.toLowerCase(),
    isDown: false,
  }))
)

// tracking whether or not key is currently pressed
const keys$ = merge(keyDown$, keyUp$).pipe(
  distinctUntilChanged((prev, curr)=> prev.key === curr.key && prev.isDown === curr.isDown),
  scan((acc, curr) => {
    acc[curr.key] = curr.isDown;
    return acc;
  }, {}),
)

// converting input to x/y values
const playerInput$ = keys$.pipe(
  map(keys => ({
    summoning: keys[' '],
    x: (keys['d'] ? 1 : 0) + (keys['a'] ? -1 : 0),
    y: (keys['s'] ? 1 : 0) + (keys['w'] ? -1 : 0),
  })),
  startWith({ x: 0, y: 0}),
)
