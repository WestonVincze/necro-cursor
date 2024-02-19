import { fromEvent, max } from 'rxjs'
import { Application, Sprite } from "pixi.js"

// Setup PixiJS APP
const container = document.querySelector('#container');
const app = new Application({ background: '#fafafa', resizeTo: container});
container.appendChild(app.view);

const bunnies = [];
const bunnyCount = 10;

for (let i = 0; i < bunnyCount; i++) {
  console.log(i)
  const sprite = Sprite.from('https://pixijs.com/assets/bunny.png');
  sprite.anchor.set(0.5);
  sprite.position.set(Math.random() * app.screen.width, Math.random() * app.screen.height);
  app.stage.addChild(sprite);
  bunnies.push(sprite);

  sprite.vx = 0;
  sprite.vy = 0;
}

const move$ = fromEvent(container, 'mousemove');

let targetX = container.clientWidth / 2;
let targetY = container.clientHeight / 2;

const followMouse = (e) => {
  const rect = container.getBoundingClientRect();
  targetX = e.clientX - rect.left;
  targetY = e.clientY - rect.top;
}

const maxSpeed = 0.01;

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

const calculateFollowForce = (sprite, speed) => {
    const followForce = { x: 0, y: 0 };
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

app.ticker.add((delta) => {
  bunnies.forEach(sprite => {
    const separationForce = calculateSeparationForce(sprite, bunnies, 50, 0.5);
    const cohesionForce = calculateCohesionForce(sprite, bunnies, 10);
    const alignmentForce = calculateAlignmentForce(sprite, bunnies, 30);
    const followForce = calculateFollowForce(sprite, 0.1);

    // Normalize forces
    const separationMagnitude = Math.sqrt(separationForce.x * separationForce.x + separationForce.y * separationForce.y);
    const cohesionMagnitude = Math.sqrt(cohesionForce.x * cohesionForce.x + cohesionForce.y * cohesionForce.y);
    const alignmentMagnitude = Math.sqrt(alignmentForce.x * alignmentForce.x + alignmentForce.y * alignmentForce.y);
    const followMagnitude = Math.sqrt(followForce.x * followForce.x + followForce.y * followForce.y);

    if (separationMagnitude > 0) {
      separationForce.x /= separationMagnitude;
      separationForce.y /= separationMagnitude;
    }

    if (alignmentMagnitude > 0) {
      alignmentForce.x /= alignmentMagnitude;
      alignmentForce.y /= alignmentMagnitude;
    }

    if (cohesionMagnitude > 0) {
      cohesionForce.x /= cohesionMagnitude;
      cohesionForce.y /= cohesionMagnitude;
    }

    if (followMagnitude > 0) {
      followForce.x /= followMagnitude;
      followForce.y /= followMagnitude;
    }

    let totalForceX = followForce.x + separationForce.x; // + alignmentForce.x + cohesionForce.x;
    let totalForceY = followForce.y + separationForce.y; // + alignmentForce.y + cohesionForce.y;

    // Limit maximum speed
    const velocityMagnitude = Math.sqrt(sprite.vx * sprite.vx + sprite.vy * sprite.vy);
    if (velocityMagnitude > maxSpeed) {
      const scale = maxSpeed / velocityMagnitude;
      totalForceX *= scale;
      totalForceY *= scale;
    }

    /*
    sprite.vx += totalForceX * delta;
    sprite.vy += totalForceY * delta;
    
    sprite.x += sprite.vx;
    sprite.y += sprite.vy;
    */

    /* DAMPENING
    sprite.vx += -sprite.vx * 0.01;
    sprite.vy += -sprite.vy * 0.01;
    */

    if (sprite.x + 10 < targetX || sprite.x - 10 > targetX) {
      sprite.vx += totalForceX * delta;
      sprite.x += sprite.vx;
    } else {
      sprite.vx = 0;
    }

    if (sprite.y + 10 < targetY || sprite.y - 10 > targetY) {
      sprite.vy += totalForceY * delta;
      sprite.y += sprite.vy;
    } else {
      sprite.vy = 0;
    }
  })
})

move$.subscribe(followMouse);
