import { fromEvent } from 'rxjs'
import { Application, Sprite } from "pixi.js"

// Setup PixiJS APP
const container = document.querySelector('#app');
console.log(container)
const app = new Application({ background: '#fafafa', width: window.innerWidth, height: window.innerHeight}); // width: 1400, height: 800, resolution: devicePixelRatio });
document.body.appendChild(app.view);


const bunny = Sprite.from('https://pixijs.com/assets/bunny.png');

bunny.anchor.set(0.5);
bunny.x = app.screen.width / 2;
bunny.y = app.screen.height / 2;

app.stage.addChild(bunny);

const move$ = fromEvent(document, 'mousemove');

let targetX = 0;
let targetY = 0;

const followMouse = (x) => {
  console.log(x);
  targetX = x.pageX
  targetY = x.pageY
}

app.ticker.add((delta) => {
  // bunny.rotation += 0.1 * delta;
  bunny.x += (targetX - bunny.x) * delta;
  bunny.y += (targetY - bunny.y) * delta;
})

move$.subscribe(followMouse);
