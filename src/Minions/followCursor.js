import { auditTime, fromEvent } from 'rxjs'
import { Sprite } from "pixi.js"
import { addAttacker, enemies, getEnemyById } from '../Enemy';
import { isIntersectingRect } from '../Colliders/isIntersecting';
import { normalizeForce } from '../helpers';
import { appService } from '../app';

// TODO: refactor and utilize the new followTarget script
export let minions = [];
let id = 0;

export const createMinion = (position) => {
  const { spriteContainer } = appService;
  const sprite = Sprite.from("/assets/skele.png");
  sprite.width = 40;
  sprite.height = 60;
  sprite.anchor.set(0.5);
  sprite.position.set(position.x, position.y);
  spriteContainer.addChild(sprite);
  sprite.vx = 0;
  sprite.vy = 0;

  minions.push({
    id: id++,
    sprite,
    target: 'cursor',
  });
}

export const FollowCursor = (spriteCount) => {
  const { app } = appService;

  // register mousemove event
  const move$ = fromEvent(container, 'mousemove');
  const result$ = move$.pipe(auditTime(200));

  let targetX = 0
  let targetY = 0;

  const followMouse = (e) => {
    const rect = container.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
  }

  result$.subscribe(followMouse)

  // create and move sprites
  const maxSpeed = 3;

  for (let i = 0; i < spriteCount; i++) {
    createMinion({ x: Math.random() * app.screen.width, y: Math.random() * app.screen.height });
  }

  app.ticker.add((delta) => {
    minions.forEach(minion => {

      enemies.forEach(enemy => {
        if (minion.target !== 'cursor') return;
        if (isIntersectingRect(minion.sprite, enemy.sprite, 100) && addAttacker(enemy.id)) {
          minion.target = enemy.id;
        }
      })

      const target = { x: targetX, y: targetY };

      if (minion.target !== 'cursor') {
        const enemy = getEnemyById(minion.target);
        if (enemy) {
          target.x = enemy.sprite.x;
          target.y = enemy.sprite.y;
        } else {
          minion.target = 'cursor';
        }
      }

      let followForce = calculateFollowForce({ targetX: target.x, targetY: target.y }, minion.sprite, 0.01);
      let separationForce = calculateSeparationForce(minion.sprite, minions, 50, 0.01);
      // let cohesionForce = calculateCohesionForce(sprite, sprites, 20);
      // let alignmentForce = calculateAlignmentForce(sprite, sprites, 20);

      // Normalize forces
      followForce = normalizeForce(followForce);
      separationForce = normalizeForce(separationForce);
      // alignmentForce = normalizeForce(alignmentForce);
      // cohesionForce = normalizeForce(cohesionForce);

      let totalForceX = followForce.x + separationForce.x; // + alignmentForce.x / 2 + cohesionForce.x / 4;
      let totalForceY = followForce.y + separationForce.y; // + alignmentForce.y / 2 + cohesionForce.y / 4;

      minion.sprite.vx += totalForceX * 0.1 * delta;
      minion.sprite.vy += totalForceY * 0.1 * delta;
      // friction (stronger when close to target)
      const closeEnough = Math.random() * (80 - 20) + 20;
      if (!(minion.sprite.x + closeEnough < target.x || minion.sprite.x - closeEnough > target.x) &&
         !(minion.sprite.y + closeEnough < target.y || minion.sprite.y - closeEnough > target.y)) {
        minion.sprite.vx *= 0.80;
        minion.sprite.vy *= 0.80;
      } else {
        minion.sprite.vx *= 0.95;
        minion.sprite.vy *= 0.95;
      }

      // Limit maximum speed
      /* no point right now, sprites cannot reach max speed
      const velocityMagnitude = Math.sqrt(minion.sprite.vx * minion.sprite.vx + minion.sprite.vy * minion.sprite.vy);
      if (velocityMagnitude > maxSpeed) {
        const scale = maxSpeed / velocityMagnitude;
        minion.sprite.vy *= scale;
        minion.sprite.vx *= scale;
      }
      */

      minion.sprite.x += minion.sprite.vx;
      minion.sprite.y += minion.sprite.vy;
    })
  })
}

export const calculateFollowForce = ({ targetX, targetY }, sprite, speed) => {
  const followForce = { x: 0, y: 0 };
  if (targetX === 0 && targetY === 0) return followForce;
  const dx = targetX - sprite.x;
  const dy = targetY - sprite.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0) {
    const directionX = dx / distance;
    const directionY = dy / distance;

    followForce.x = directionX * speed;
    followForce.y = directionY * speed;
  }

  return followForce;
}

const calculateSeparationForce = (sprite, flock, separationRadius = 1, maxOverlapRatio) => {
  const separationForce = { x: 0, y: 0 };

  flock.forEach(minion => {
    const otherSprite = minion.sprite;
    if (otherSprite !== sprite) {
      const dx = otherSprite.x - sprite.x;
      const dy = otherSprite.y - sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // check for collision
      const minDistance = sprite.width / 2 + otherSprite.width / 2;
      if (distance < minDistance) {
        const overlapRatio = (minDistance - distance) / minDistance;

        if (overlapRatio > maxOverlapRatio && distance < separationRadius) {
          const separationDirectionX = dx / distance;
          const separationDirectionY = dy / distance;

          separationForce.x -= separationDirectionX;
          separationForce.y -= separationDirectionY;
        }
      }
    }
  })

  return separationForce;
}

const calculateCohesionForce = (sprite, flock, cohesionRadius) => {
  const cohesionForce = { x: 0, y: 0 };
  const neighbors = [];

  flock.forEach(otherSprite => {
    if (otherSprite !== sprite) {
      const dx = otherSprite.x - sprite.x;
      const dy = otherSprite.y - sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < cohesionRadius) {
        neighbors.push(otherSprite);
      }
    }
  });

  if (neighbors.length > 0) {
    // Calculate average position of neighbors
    const avgPosition = neighbors.reduce((acc, neighbor) => {
      acc.x += neighbor.x;
      acc.y += neighbor.y;
      return acc;
    }, { x: 0, y: 0 });

    avgPosition.x /= neighbors.length;
    avgPosition.y /= neighbors.length;

    // Calculate cohesion force towards the average position
    cohesionForce.x = avgPosition.x - sprite.x;
    cohesionForce.y = avgPosition.y - sprite.y;
  }

  return cohesionForce;
};

const calculateAlignmentForce = (sprite, flock, alignmentRadius) => {
  const alignmentForce = { x: 0, y: 0 };
  const neighbors = [];

  flock.forEach(otherSprite => {
    if (otherSprite !== sprite) {
      const dx = otherSprite.x - sprite.x;
      const dy = otherSprite.y - sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < alignmentRadius) {
        neighbors.push(otherSprite);
      }
    }
  });

  if (neighbors.length > 0) {
    // Calculate average velocity of neighbors
    const avgVelocity = neighbors.reduce((acc, neighbor) => {
      acc.x += neighbor.vx;
      acc.y += neighbor.vy;
      return acc;
    }, { x: 0, y: 0 });

    avgVelocity.x /= neighbors.length;
    avgVelocity.y /= neighbors.length;

    // Calculate alignment force towards the average velocity
    alignmentForce.x = avgVelocity.x - sprite.vx;
    alignmentForce.y = avgVelocity.y - sprite.vy;
  }

  return alignmentForce;
};
