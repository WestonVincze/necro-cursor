import { fromEvent } from 'rxjs'
import { Application, Sprite } from "pixi.js"

// Setup PixiJS APP
const container = document.querySelector('#container');
console.log(container)
const app = new Application({ background: '#fafafa', resizeTo: container});
container.appendChild(app.view);

const bunny = Sprite.from('https://pixijs.com/assets/bunny.png');
const bunny2 = Sprite.from('https://pixijs.com/assets/bunny.png');
const bunny3 = Sprite.from('https://pixijs.com/assets/bunny.png');

bunny.anchor.set(0.5);
bunny.x = container.clientWidth / 2;
bunny.y = container.clientHeight / 2;

app.stage.addChild(bunny);

const move$ = fromEvent(container, 'mousemove');

let targetX = container.clientWidth / 2;
let targetY = container.clientHeight / 2;

const followMouse = (e) => {
  const rect = container.getBoundingClientRect();
  targetX = e.clientX - rect.left;
  targetY = e.clientY - rect.top;
}

const speed = 1;

app.ticker.add(() => {
  const dx = targetX - bunny.x;
  const dy = targetY - bunny.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const directionX = dx / distance;
  const directionY = dy / distance;

  const moveX = directionX * speed;
  const moveY = directionY * speed;
  
  if (bunny.x + 50 < targetX || bunny.x - 50 > targetX) {
    bunny.x += moveX;
  }
  if (bunny.y + 50 < targetY || bunny.y - 50 > targetY) {
    bunny.y += moveY;
  }
})

move$.subscribe(followMouse);
