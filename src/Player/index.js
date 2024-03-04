import { Container, Graphics, Sprite } from "pixi.js";
import { distinctUntilChanged, filter, fromEvent, map, merge, scan, startWith } from "rxjs";
import { Health } from "../Health";
import { distanceBetweenPoints, isIntersectingRect } from "../Colliders/isIntersecting";
import { appService } from "../app";
import { killCount } from "../Enemies";
import { bones, removeBones } from "../Drops";
import { createMinion, minions } from "../Minions";
import { GameOver } from "../Views/GameOver";
import { normalizeForce } from "../helpers";
import { RadialSpell } from "../Spells";

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

  const health = Health({ maxHP: 100, container});

  health.subscribeToDeath(() => {
    GameOver({ killCount, armySize: summons });
    app.ticker.stop();
  })

  const player = {
    sprite: container,
    health,
    attackers: [],
    summoningCircle: null,
  }
  
  return player;
}

export const Player = () => {
  const { app } = appService;
  const player = initializePlayer();
  const sprite = player.sprite;

  // state
  let [ moveX, moveY ] = [0, 0]
  // TODO: implement a state machine to manage player state
  const handleInput = ({ x, y, summoning }) => {
    if (summoning) {
      if (!player.summoningCircle?.casting) {
        player.summoningCircle = RadialSpell({
          position: sprite,
          maxRadius: 150,
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
          color: 0xffaaff
        })
      }
      moveX = 0;
      moveY = 0;
    } else {
      if (player.summoningCircle !== null) {
        player.summoningCircle.stopCast();
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
      sprite.vx += -sprite.vx * 0.05 * delta;
    } else {
      sprite.vx += x * 0.3 * delta;
    }

    if (y === 0) {
      sprite.vy += -sprite.vy * 0.05 * delta;
    } else {
      sprite.vy += y * 0.3 * delta;
    }

    // limit max speed
    const magnitude = (sprite.vx * sprite.vx + sprite.vy * sprite.vy);
    if (magnitude > 5) {
      const scale = 5 / magnitude
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
