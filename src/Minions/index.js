import { Sprite } from "pixi.js";

const initializeMinions = (app, spriteURL) => {
  // create container
  // attach container to stage
  for (let i = 0; i < spriteCount; i++) {
    const sprite = Sprite.from(spriteURL);
    sprite.width = 40;
    sprite.height = 60;
    sprite.anchor.set(0.5);
    sprite.position.set(Math.random() * app.screen.width, Math.random() * app.screen.height);
    app.stage.addChild(sprite);
    sprite.vx = 0;
    sprite.vy = 0;

    minions.push({
      id: id++,
      sprite,
      target: 'cursor',
    });
  }

}
const addMinion = () => {

}