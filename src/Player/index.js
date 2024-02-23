import { Graphics, Sprite } from "pixi.js";
import { distinctUntilChanged, filter, fromEvent, map, merge, scan, startWith } from "rxjs";
import { Health } from "../Health";
import { isIntersectingRect } from "../Colliders/isIntersecting";

const initializePlayer = (app) => {
  // initialize player
  const sprite = Sprite.from("assets/necro.png");
  sprite.width = 50;
  sprite.height = 114;
  sprite.anchor.set(0.5);
  sprite.position.set(app.screen.width / 2, app.screen.height / 2);
  sprite.vx = 0;
  sprite.vy = 0;
  app.stage.addChild(sprite);
  console.log(sprite);
  const health = Health({ maxHP: 100, sprite })
  sprite.parent.addChild(health.healthBar.container);
  health.subscribeToDeath(() => {
    alert("GAME OVER KID");
    window.location.reload();
  })

  const player = {
    sprite,
    health,
    attackers: [],
  }
  
  return player;
}

export const Player = (app) => {
  const player = initializePlayer(app);
  const sprite = player.sprite;

  // state
  let [ moveX, moveY ] = [0, 0]
  const updateMoveInput = ({ x, y }) => {
    moveX = x;
    moveY = y;
  }

  moveInput$.subscribe((e) => updateMoveInput(e))

  // apply x and y state to move player
  app.ticker.add((delta) => {
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
const inputs = ['w', 'a', 's', 'd'];

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
const moveInput$ = keys$.pipe(
  map(keys => ({
    x: (keys['d'] ? 1 : 0) + (keys['a'] ? -1 : 0),
    y: (keys['s'] ? 1 : 0) + (keys['w'] ? -1 : 0),
  })),
  startWith({ x: 0, y: 0}),
)
