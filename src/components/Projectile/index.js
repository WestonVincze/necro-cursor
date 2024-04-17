import { Sprite } from "pixi.js";
import { projectiles } from "../../data/projectiles";

const Projectile = ({
  startPos,
  direction,
  maxDistance,
  name,
  whileAlive, // function to repeat while alive?
  onDestroy, // if we should do anything once it breaks?
}) => {
  const projectileData = projectiles[name];

  if (!projectileData) {
    console.error(`Projectile ${name} not found.`)
  }

  const sprite = Sprite.from(projectileData.url);
  sprite.width = projectileData.width;
  sprite.height = projectileData.height;

}
