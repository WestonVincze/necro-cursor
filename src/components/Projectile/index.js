import { Sprite } from "pixi.js";
import { projectiles } from "../../data/projectiles";
import { appService } from "../../app";

export const Projectile = ({
  startPos,
  targetPos,
  maxDistance,
  name,
  whileAlive, // function to repeat while alive?
  onDestroy, // if we should do anything once it breaks?
}) => {
  const projectileData = projectiles[name];

  if (!projectileData) {
    console.error(`Projectile ${name} not found.`)
  }
  
  const { spriteContainer, physicsUpdate } = appService;

  const sprite = Sprite.from(projectileData.url);
  sprite.width = projectileData.width;
  sprite.height = projectileData.height;

  spriteContainer.addChild(sprite);

  const dx = targetPos.x - startPos.x;
  const dy = targetPos.y - startPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const directionX = dx / distance;
  const directionY = dy / distance;

  let angle = Math.atan2(dy, dx) + 180 * (Math.PI / 180);

  sprite.rotation = angle;

  const moveProjectile = physicsUpdate.subscribe(() => {
    // calculate direction to apply force
    // normalize the x, y vector
    // apply force
    sprite.x += directionX * projectileData.speed;
    sprite.y += directionY * projectileData.speed;
  })

  return { moveProjectile }
}
