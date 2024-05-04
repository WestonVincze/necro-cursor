import { Graphics } from "pixi.js";
/**
 * This is a crude version of collision detection. I'd like to create an event management system that sprites could subscribe to.
 * If performance starts to hinder, I'll look into re-working this system.
 */

/** Rectangular */
export const isIntersectingRect = (a, b, range = 0) => {
  if (!a.isSprite || !b.isSprite) {
    console.log('WARNING')
    return false;
  }
  const aBox = a.getBounds();
  const bBox = b.getBounds();

  return aBox.x + aBox.width  / 2 > bBox.x - bBox.width  / 2 - range &&
         aBox.x - aBox.width  / 2 < bBox.x + bBox.width  / 2 + range &&
         aBox.y + aBox.height / 2 > bBox.y - bBox.height / 2 - range &&
         aBox.y - aBox.height / 2 < bBox.y + bBox.height / 2 + range;
  return aBox.x + aBox.width / 2 > bBox.x - range &&
         aBox.x < bBox.x + bBox.width + range &&
         aBox.y + aBox.height > bBox.y - range &&
         aBox.y < bBox.y + bBox.height + range 
}

export const drawHitboxRect = (sprite, range) => {
  const hitBox = new Graphics();
  hitBox.lineStyle(2, 0xFF0000, 0.1);
  const spriteBounds = sprite.getBounds();
  hitBox.drawRect(spriteBounds.x - range, spriteBounds.y - range, spriteBounds.width + range * 2, spriteBounds.height + range * 2)
  sprite.parent.addChild(hitBox);
  return hitBox;
}

export const distanceBetweenPoints = (p1, p2) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Circular (WIP) */
const isIntersectingCircle = (a, b) => {
  // Get bounds of both objects
  const aBounds = a.getBounds();
  const bBounds = b.getBounds();

  // Calculate center coordinates of both objects
  const aCenterX = aBounds.x + aBounds.width / 2;
  const aCenterY = aBounds.y + aBounds.height / 2;
  const bCenterX = bBounds.x + bBounds.width / 2;
  const bCenterY = bBounds.y + bBounds.height / 2;

  // Calculate distance between centers of both objects
  const distanceX = aCenterX - bCenterX;
  const distanceY = aCenterY - bCenterY;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  // Calculate sum of radii
  const sumRadii = Math.max(aBounds.width, aBounds.height) / 2 + Math.max(bBounds.width, bBounds.height) / 2;

  // Check if the distance between centers is less than the sum of radii
  return distance < sumRadii;
};

const drawHitboxCircle = (sprite, range) => {
  const hitBox = new Graphics();
  hitBox.lineStyle(2, 0xFF0000);
  const spriteBounds = sprite.getBounds();
  const centerX = spriteBounds.x + spriteBounds.width / 2;
  const centerY = spriteBounds.y + spriteBounds.height / 2;
  hitBox.drawCircle(centerX, centerY, radius);
  sprite.parent.addChild(hitBox);
}

/** Notes */
// would it be worth it to have a "collider" that simply checks if the distance between two points is within a threshhold?


/**
 * getLocalBounds has a "containsPoint" function... maybe we can use that to determine whether or not sprites overlap? 
 * 
 * below, we have a sprite and each star represents the sprites "colliders"
 * 
 * if a dot is "containedWithin" a potential target's sprite, then we know we are colliding
 * 
 *      * * *
 *       [ ]
 *      *[ ]*
 *       [ ]
 *      * * *
 * 
 * gotchas:
 *  - we need to ensure that no sprite can fit between another sprites "colliders" (we can solve this by deciding on a smallest unit and ensuring the auto-generated "colliders" are never further apart than the defined value)
 * 
 */
