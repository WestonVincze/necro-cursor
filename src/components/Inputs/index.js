import { distinctUntilChanged, filter, fromEvent, map, merge, scan } from "rxjs";
// player input and observables
const inputs = ['w', 'a', 's', 'd', ' ', 'enter', 'escape', '`'];

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
export const activeKeys$ = merge(keyDown$, keyUp$).pipe(
  distinctUntilChanged((prev, curr)=> prev.key === curr.key && prev.isDown === curr.isDown),
  scan((acc, curr) => {
    acc[curr.key] = curr.isDown;
    return acc;
  }, {}),
)
