import { Container, Graphics, Ticker, Text } from "pixi.js";

const createHitSplatSpots = (container) => {
  const numSpots = 4;
  const rect = container.getBounds();
  const hitSplatSpots = [];

  const quarterWidth = rect.width / 4;
  const quarterHeight = rect.height / 4;

  const offsets = [
    { x: -quarterWidth, y: -quarterHeight },
    { x: quarterWidth, y: -quarterHeight },
    { x: -quarterWidth, y: quarterHeight },
    { x: quarterWidth, y: quarterHeight },
  ]

  for (let i = 0; i < numSpots; i++) {
    const spotContainer = new Container();
    spotContainer.position.set(offsets[i].x, offsets[i].y);
    container.addChild(spotContainer);
    hitSplatSpots.push({ container: spotContainer, available: true, age: null });
  }

  return hitSplatSpots;
}

const getNextSpot = (spots) => {
  let spot = spots.find(spot => spot.available);

  if (!spot) {
    // all spots are filled, find the oldest
    spot = spots.reduce((oldest, current) => {
      if (current.age < oldest.age) {
        return current;
      } else {
        return oldest;
      }
    })
  }

  return spot;
}

export const HitSplats = (container) => {
  const spots = createHitSplatSpots(container);

  const spawnHitSplat = (damage) => {
    const spot = getNextSpot(spots);

    const hitSplatContainer = new Container();
    // add a 10% variance to the x and y offsets
    const positionVariance = 10;
    hitSplatContainer.x += (Math.random() * positionVariance * 2) - positionVariance;
    hitSplatContainer.y += (Math.random() * positionVariance * 2) - positionVariance;

    const text = new Text(damage, { style: { fontFamily: 'monospace', fontSize: 10 }});
    text.anchor.set(0.5);

    const star = new Graphics();
    star.beginFill(damage > 0 ? 0xff5555 : 0x5555ff);
    star.drawCircle(0, 0, 15);
    star.endFill();

    hitSplatContainer.addChild(star);
    hitSplatContainer.addChild(text);

    spot.container.addChild(hitSplatContainer);
    spot.available = false;
    spot.age = Date.now();

    const tween = new Ticker();

    const clearSpot = () => {
      spot.container.removeChild(hitSplatContainer);
      spot.available = true;
      spot.age = null;
      tween.stop();
    }

    // TODO: improve look of this, but it's okay for now
    // don't let framerate impact the animation either
    tween.add(() => {
      hitSplatContainer.alpha -= 0.005;
      hitSplatContainer.width *= 0.99;
      hitSplatContainer.height *= 0.99;
      if (hitSplatContainer.alpha <= 0.2) {
        clearSpot();
      }
    })

    tween.start();
  }

  return { spawnHitSplat }
}
