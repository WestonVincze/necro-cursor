import { Graphics, Sprite } from "pixi.js";
import { distinctUntilChanged, filter, fromEvent, map, merge, scan, startWith } from "rxjs";
import { Health } from "../Health";
import { distanceBetweenPoints, isIntersectingRect } from "../Colliders/isIntersecting";
import { appService } from "../app";
import { bones, removeBones, killCount } from "../Enemy";
import { createMinion } from "../Minions/followCursor";
import { minions } from "../Minions/followCursor";
import { GameOverScreen } from "../Views/GameOver";

const drawSummoningCircle = ({ x, y, maxRadius }) => {
  const { UIContainer } = appService;
  const circle = new Graphics();
  circle.lineStyle({ width: 2, color: 0xffaaff})

  let radius = 10;
  circle.drawCircle(x, y, radius);

  UIContainer.addChild(circle)

  const growCircle = ({ x, y }) => {
    if (radius >= maxRadius) return radius;
    circle.clear();
    circle.lineStyle({ width: 2, color: 0xffaaff})
    radius += 0.5;
    circle.drawCircle(x, y, radius);

    return radius;
  }

  return { circle, growCircle };
}

const initializePlayer = () => {
  const { app, spriteContainer, UIContainer } = appService;
  const sprite = Sprite.from("assets/necro.png");
  sprite.width = 50;
  sprite.height = 114;
  sprite.anchor.set(0.5);
  sprite.position.set(app.screen.width / 2, app.screen.height / 2);
  sprite.vx = 0;
  sprite.vy = 0;
  spriteContainer.addChild(sprite);
  const health = Health({ maxHP: 100, sprite })
  UIContainer.addChild(health.healthBar.container);

  health.subscribeToDeath(() => {
    GameOverScreen({ killCount, armySize: minions.length })
    app.ticker.stop();
  })

  const player = {
    sprite,
    health,
    attackers: [],
    summoningCircle: null,
    summonRange: 0,
  }
  
  return player;
}

export const Player = () => {
  const { app, gameTicks$ } = appService;
  const player = initializePlayer();
  const sprite = player.sprite;

  // state
  let [ moveX, moveY ] = [0, 0]
  // TODO: implement a state machine to manage player state
  const handleInput = ({ x, y, summoning }) => {
    if (summoning) {
      if (player.summoningCircle === null) {
        player.summoningCircle = drawSummoningCircle({ x: player.sprite.x, y: player.sprite.y, maxRadius: 150 });
      }
      moveX = 0;
      moveY = 0;
    } else {
      if (player.summoningCircle !== null) {
        bones.map(b => {
          if (distanceBetweenPoints(b.sprite, sprite) <= player.summonRange) {
            createMinion(b.sprite);
            removeBones(b);
          }
        }); 

        player.summoningCircle.circle.destroy();
        player.summoningCircle = null;
      }
      moveX = x;
      moveY = y;
    }
  }

  playerInput$.subscribe((e) => handleInput(e))

  gameTicks$.subscribe(() => {
  })

  // apply x and y state to move player
  app.ticker.add((delta) => {
    if (player.summoningCircle) {
      player.summonRange = player.summoningCircle.growCircle(player.sprite);
    }
    if (moveX === 0) {
      sprite.vx += -sprite.vx * 0.1 * delta;
    } else {
      sprite.vx += moveX * 0.3 * delta;
    }

    if (moveY === 0) {
      sprite.vy += -sprite.vy * 0.1 * delta;
    } else {
      sprite.vy += moveY * 0.3 * delta;
    }

    // limit max speed
    const magnitude = (sprite.vx * sprite.vx + sprite.vy * sprite.vy);
    if (magnitude > 3) {
      const scale = 3 / magnitude
      sprite.vx *= scale;
      sprite.vy *= scale;
    }

    const position = { x: sprite.x += sprite.vx, y: sprite.y += sprite.vy }

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
