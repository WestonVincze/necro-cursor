import { gameState } from '../../app';
import { normalizeForce } from '../../helpers';

/**
 * @param {Object} options 
 * @param {number} options.followForce
 * @param {number} options.separation 
 * @param {number} options.cohesion
 * @param {number} options.alignment
 * @param {number} options.maxSpeed
 */
export const followTarget = (sprite, target, speed, delta, options) => {
  // get the sprites from our swarm
  const sprites = gameState.allUnits;
  let { x: targetX, y: targetY } = target;

  const forces = {
    follow: { x: 0, y: 0 },
    separation: { x: 0, y: 0 },
    cohesion: { x: 0, y: 0 },
    alignment: {x: 0, y: 0 },
  }

  /*
  perhaps the caller of followForce should be responsible for determining the follow force to add
  if (options?.closeEnough && options?.followForce) {
    if (!(sprite.x + options.closeEnough.x < target.x || sprite.x - options.closeEnough.x > target.x) &&
        !(sprite.y + options.closeEnough.y < target.y || sprite.y - options.closeEnough.y > target.y)) {
      options.followForce = 0;
    }
  }
  */

  if (options?.followForce > 0) {
    forces.follow = calculateFollowForce({ targetX, targetY }, sprite);
    forces.follow.x *= options.followForce;
    forces.follow.y *= options.followForce;
  }

  if (options?.separation) {
    forces.separation = calculateSeparationForce(sprite, sprites, 0);
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

  const totalForceNormalized = normalizeForce({ x: totalForceX, y: totalForceY });

  sprite.vx += totalForceNormalized.x * speed * delta;
  sprite.vy += totalForceNormalized.y * speed * delta;

  // friction
  sprite.vx *= 0.95;
  sprite.vy *= 0.95;

  // Limit maximum speed
  if (options?.maxSpeed > 0) {
    const magnitude = Math.sqrt(sprite.vx * sprite.vx + sprite.vy * sprite.vy);
    if (magnitude > options.maxSpeed) {
      const scale = options.maxSpeed / magnitude
      sprite.vx *= scale;
      sprite.vy *= scale;
    }
  }

  sprite.x += sprite.vx;
  sprite.y += sprite.vy;
}

export const calculateFollowForce = ({ targetX, targetY }, sprite) => {
  const followForce = { x: 0, y: 0 };
  const dx = targetX - sprite.x;
  const dy = targetY - sprite.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0) {
    const directionX = dx / distance;
    const directionY = dy / distance;

    followForce.x = directionX;
    followForce.y = directionY;
  }

  return followForce;
}

/*
const generateSymmetricKey = (index1, index2) => {
  const [ first, second ] = [index1, index2].sort();
  return `${first}-${second}`;
}
*/

// raycast at 4 points and if an overlap is detected apply separation force?
const calculateSeparationForce = (sprite, flock, maxOverlapRatio) => {
  const separationForce = { x: 0, y: 0 };

  // const index = flock.findIndex(s => s === sprite);
  flock.forEach((unit, i) => {
    const otherSprite = unit;
    if (!otherSprite.destroyed && otherSprite !== sprite) {
      /*
      const id = generateSymmetricKey(index, i);
      if (gameState.separationForceCache.has(id)) {
        return gameState.separationForceCache.get(id);
      }
      */
      const dx = otherSprite.x - sprite.x;
      const dy = otherSprite.y - sprite.y;
      let distance = dx * dx + dy * dy;

      // check for collision
      let minDistance = sprite.width / 2 + otherSprite.width / 2;
      if (distance < minDistance ** 2) {
        distance = Math.sqrt(distance);
        const overlapRatio = (minDistance - distance) / minDistance;

        if (overlapRatio > maxOverlapRatio) {
          const separationDirectionX = dx / distance;
          const separationDirectionY = dy / distance;

          separationForce.x -= separationDirectionX;
          separationForce.y -= separationDirectionY;
        }
      }
      // gameState.separationForceCache.set(id, separationForce);
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
      let distance = dx * dx + dy * dy;

      if (distance < cohesionRadius ** 2) {
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
      const distance = dx * dx + dy * dy;

      if (distance < alignmentRadius ** 2) {
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
