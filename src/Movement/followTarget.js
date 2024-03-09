import { normalizeForce } from '../helpers';

/**
 * @param {Object} options 
 * @param {number} options.followForce
 * @param {number} options.separation 
 * @param {number} options.cohesion
 * @param {number} options.alignment
 * @param {number} options.maxSpeed
 */
export const followTarget = (sprite, swarm, target, delta, options) => {
  // we'll need a proper system to manage swarms consistently
  // a swarm should be an object with relevent data
  const sprites = swarm.map(s => s.sprite);
  const forces = {
    follow: { x: 0, y: 0 },
    separation: { x: 0, y: 0 },
    cohesion: { x: 0, y: 0 },
    alignment: {x: 0, y: 0 },
  }

  forces.follow = calculateFollowForce({ targetX: target.x, targetY: target.y }, sprite, options?.followForce || 0.001);

  if (options?.separation) {
    forces.separation = calculateSeparationForce(sprite, sprites, 50, 0.01);
    forces.separation.x *= options.separation;
    forces.separation.y *= options.separation;
  }

  if (options?.cohesion) {
    forces.cohesion = calculateCohesionForce(sprite, sprites, 200);
    forces.cohesion.x *= options.cohesion;
    forces.cohesion.y *= options.cohesion;
  }

  if (options?.alignment) {
    forces.alignment = calculateAlignmentForce(sprite, sprites, 400);
    forces.alignment.x *= options.alignment;
    forces.alignment.y *= options.alignment;
  }

  const totalForceX = forces.follow.x + forces.separation.x + forces.alignment.x + forces.cohesion.x;
  const totalForceY = forces.follow.y + forces.separation.y + forces.alignment.y + forces.cohesion.y;

  sprite.vx += totalForceX * 0.1 * delta;
  sprite.vy += totalForceY * 0.1 * delta;

  // friction (stronger when close to target)
  const closeEnough = Math.random() * (80 - 20) + 20;
  let isInRange = false;
  if (!(sprite.x + closeEnough < target.x || sprite.x - closeEnough > target.x) &&
      !(sprite.y + closeEnough < target.y || sprite.y - closeEnough > target.y)) {
    isInRange = true;
    sprite.vx *= 0.80;
    sprite.vy *= 0.80;
  } else {
    isInRange = false;
    sprite.vx *= 0.95;
    sprite.vy *= 0.95;
  }

  // Limit maximum speed
  if (options?.maxSpeed > 0) {
    const velocityMagnitude = Math.sqrt(sprite.vx * sprite.vx + sprite.vy * sprite.vy);
    if (velocityMagnitude > options.maxSpeed) {
      const scale = options.maxSpeed / velocityMagnitude;
      sprite.vy *= scale;
      sprite.vx *= scale;
    }
  }

  sprite.x += sprite.vx;
  sprite.y += sprite.vy;
  return isInRange;
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

  return normalizeForce(followForce);
}

// raycast at 4 points and if an overlap is detected apply separation force?
const calculateSeparationForce = (sprite, flock, separationRadius = 1, maxOverlapRatio) => {
  const separationForce = { x: 0, y: 0 };

  flock.forEach(minion => {
    const otherSprite = minion;
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

  return normalizeForce(separationForce);
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

  return normalizeForce(cohesionForce);
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
