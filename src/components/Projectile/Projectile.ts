import { Sprite } from "pixi.js";
import { projectiles } from "../../data/projectiles";
import { appService, gameState } from "../../app";
import { normalizeForce } from "../../helpers";
import { take } from "rxjs";
import { isIntersectingRect } from "../Colliders/isIntersecting";
import { UnitData } from "../../data/units";
import { Unit } from "../Unit/Unit";

interface ProjectProps {
  startPos: { x: number, y: number },
  targetPos: { x: number, y: number },
  maxLifetimeTicks?: number,
  name: string,
  viableTargets: Unit[],
  onCollide: (target: Unit) => void,
  onDestroy?: () => void,
}

export const Projectile = ({
  startPos,
  targetPos,
  maxLifetimeTicks = 8,
  name,
  viableTargets,
  onCollide,
  onDestroy,
}: ProjectProps) => {
  const projectileData = projectiles[name];

  if (!projectileData) {
    console.error(`Projectile ${name} not found.`)
  }
  
  const { spriteContainer, physicsUpdate, gameTicks$ } = appService;

  const sprite = Sprite.from(projectileData.url);
  sprite.width = projectileData.width;
  sprite.height = projectileData.height;
  sprite.x = startPos.x;
  sprite.y = startPos.y;

  spriteContainer.addChild(sprite);

  const dx = targetPos.x - startPos.x;
  const dy = targetPos.y - startPos.y;

  let angle = Math.atan2(dy, dx);
  sprite.rotation = angle;

  const force = normalizeForce({ x: dx, y: dy });

  const moveProjectile = physicsUpdate.subscribe(() => {
    if (sprite.destroyed) return;

    sprite.x += force.x * projectileData.speed;
    sprite.y += force.y * projectileData.speed;
    viableTargets.find(target => {
      if (!target.sprite.destroyed && isIntersectingRect(sprite, target.sprite, -20)) {
        onCollide?.(target);
        destroyProjectile();
        return true;
      }
    });
  })

  const destroyProjectile = () => {
    if (sprite.destroyed) return;

    moveProjectile.unsubscribe();
    sprite.destroy();
    onDestroy?.();
  }

  gameTicks$
    .pipe(
      take(maxLifetimeTicks)
    )
    .subscribe(null, null, destroyProjectile);
  return { moveProjectile }
}
