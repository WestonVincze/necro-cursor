import { Sprite } from "pixi.js";
import { distinctUntilChanged, filter, fromEvent, map, merge, scan, startWith } from "rxjs";

const initializePlayer = (app) => {
  // initialize player
  const player = Sprite.from("assets/necro.png");
  player.width = 50;
  player.height = 114;
  player.anchor.set(0.5);
  player.position.set(app.screen.width / 2, app.screen.height / 2);
  player.vx = 0;
  player.vy = 0;
  app.stage.addChild(player);
  
  return player;
}

export const Player = (app) => {
  const player = initializePlayer(app);

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
      player.vx += -player.vx * 0.1 * delta;
    } else {
      player.vx += moveX * 0.3 * delta;
    }

    if (moveY === 0) {
      player.vy += -player.vy * 0.1 * delta;
    } else {
      player.vy += moveY * 0.3 * delta;
    }

    // limit max speed
    const magnitude = (player.vx * player.vx + player.vy * player.vy);
    if (magnitude > 3) {
      const scale = 3 / magnitude
      player.vx *= scale;
      player.vy *= scale;
    }

    const position = { x: player.x += player.vx, y: player.y += player.vy }

    position.x = Math.min(Math.max(position.x, player.width / 2), app.screen.width - player.width / 2);
    position.y = Math.min(Math.max(position.y, player.height / 2), app.screen.height - player.height / 2);
    player.x = position.x;
    player.y = position.y;
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
