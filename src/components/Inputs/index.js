import { distinctUntilChanged, filter, fromEvent, map, merge, scan } from "rxjs";
// TODO: label input actions to allow easy re-mapping
// other components should listen for named triggers, inputs will manage the actions
const inputActions = {
  moveLeft: ["a"],
  moveRight: ["d"],
  moveUp: ["w"],
  moveDown: ["s"],
  castSpell: [" "],
  pause: ["escape"],
  debugMode: ["`"],
}
// player input and observables
const inputs = ['w', 'a', 's', 'd', ' ', 'enter', 'escape', '`', 'q', 'e', 'f'];

export const keyDown$ = fromEvent(document, 'keydown').pipe(
  filter(e => inputs.includes(e.key.toLowerCase())),
  map(e => ({
    key: e.key.toLowerCase(),
    isDown: true,
  }))
)

export const keyUp$ = fromEvent(document, 'keyup').pipe(
  filter(e => inputs.includes(e.key.toLowerCase())),
  map(e => ({
    key: e.key.toLowerCase(),
    isDown: false,
  }))
)

// tracking whether or not key is currently pressed
export const activeKeys$ = merge(keyDown$, keyUp$).pipe(
  distinctUntilChanged((prev, curr)=> prev.key === curr.key && prev.isDown === curr.isDown),
  scan((acc, curr) => {
    acc[curr.key] = curr.isDown;
    return acc;
  }, {}),
)
