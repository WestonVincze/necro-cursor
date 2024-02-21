import { auditTime, fromEvent } from 'rxjs'
import { Sprite } from "pixi.js"

export const FollowCursor = (app, spriteURL, spriteCount) => {
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
  const sprites = [];
  const maxSpeed = 3;

  for (let i = 0; i < spriteCount; i++) {
    const sprite = Sprite.from(spriteURL);
    sprite.width = 40;
    sprite.height = 60;
    sprite.anchor.set(0.5);
    sprite.position.set(Math.random() * app.screen.width, Math.random() * app.screen.height);
    app.stage.addChild(sprite);
    sprites.push(sprite);

    sprite.vx = 0;
    sprite.vy = 0;
  }

  const enemy = Sprite.from("https://pixijs.com/assets/bunny.png");
  enemy.position.set(app.screen.width / 4, app.screen.height / 4);
  app.stage.addChild(enemy);

  const isIntersecting = (a, b) => {

  }

  app.ticker.add((delta) => {
    sprites.forEach((sprite, i) => {
      // if (isIntersecting(sprite, enemy)) return;
      let followForce = calculateFollowForce({ targetX, targetY }, sprite, 0.5);
      let separationForce = calculateSeparationForce(sprite, sprites, 50, 0.01);
      let cohesionForce = calculateCohesionForce(sprite, sprites, 20);
      let alignmentForce = calculateAlignmentForce(sprite, sprites, 20);
      // if (i === 0) console.log(followForce, separationForce, cohesionForce, alignmentForce);

      // Normalize forces
      followForce = normalizeForce(followForce);
      separationForce = normalizeForce(separationForce);
      alignmentForce = normalizeForce(alignmentForce);
      cohesionForce = normalizeForce(cohesionForce);

      let totalForceX = followForce.x + separationForce.x + alignmentForce.x / 2 + cohesionForce.x / 4;
      let totalForceY = followForce.y + separationForce.y + alignmentForce.y / 2 + cohesionForce.y / 4;

      // friction (stronger when close to target)
      const closeEnough = Math.random() * (80 - 20) + 20;
      if (!(sprite.x + closeEnough < targetX || sprite.x - closeEnough > targetX) &&
         !(sprite.y + closeEnough < targetY || sprite.y - closeEnough > targetY)) {
        sprite.vx *= 0.80;
        sprite.vy *= 0.80;
      } else {
        sprite.vx *= 0.95;
        sprite.vy *= 0.95;
      }

      sprite.vx += totalForceX * 0.1 * delta;
      sprite.vy += totalForceY * 0.1 * delta;


      // Limit maximum speed
      /*
      const velocityMagnitude = Math.sqrt(sprite.vx * sprite.vx + sprite.vy * sprite.vy);
      if (velocityMagnitude > maxSpeed) {
        const scale = maxSpeed / velocityMagnitude;
        sprite.vy *= scale;
        sprite.vx *= scale;
      }
      */

      sprite.x += sprite.vx;
      sprite.y += sprite.vy;
    })
  })
}

const calculateFollowForce = ({ targetX, targetY }, sprite, speed) => {
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

  flock.forEach(otherSprite => {
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

const normalizeForce = ({ x, y }) => {
  const magnitude = Math.sqrt(x * x + y * y);

  if (magnitude > 0) {
    x /= magnitude;
    y /= magnitude;
  }

  return { x, y }
}
