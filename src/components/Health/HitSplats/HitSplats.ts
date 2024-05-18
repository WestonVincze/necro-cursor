import { Container, Graphics, Ticker, Text, SHAPES } from "pixi.js";
import { appService } from "../../../app";

const createHitSplatSpots = (sprite) => {
  const numSpots = 4;
  const { width, height } = sprite;
  const hitSplatSpots = [];

  const quarterWidth = width / 4;
  const quarterHeight = height / 4;

  const offsets = [
    { x: -quarterWidth, y: -quarterHeight },
    { x: quarterWidth, y: -quarterHeight },
    { x: -quarterWidth, y: quarterHeight },
    { x: quarterWidth, y: quarterHeight },
  ]

  for (let i = 0; i < numSpots; i++) {
    hitSplatSpots.push({ offset: offsets[i], available: true, age: null });
  }

  // console.log(hitSplatSpots);
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

const hitSplatColors = {
  friendly: {
    miss: 0xdbaded,
    hit: 0xc360eb,
    crit: 0xab17e6,
  },
  hostile: {
    miss: 0xff9191,
    hit: 0xff5555,
    crit: 0xed2424,
  }
}

export const HitSplats = (sprite, type) => {
  const spots = createHitSplatSpots(sprite);
  const colors = type === "enemy" ? hitSplatColors.hostile : hitSplatColors.friendly;
  const { UIContainer } = appService;

  const spawnHitSplat = (damage, isCrit) => {
    let color = colors.hit;
    if (damage === 0) {
      color = colors.miss;
    } else if (isCrit) {
      color = colors.crit;
    }

    const spot = getNextSpot(spots);

    const hitSplatContainer = new Container();
    // add a 10% variance to the x and y offsets
    const positionVariance = 5;
    hitSplatContainer.position.set(sprite.x + spot.offset.x, sprite.y + spot.offset.y);

    const x = spot.offset.x + (Math.random() * positionVariance * 2) - positionVariance
    const y = spot.offset.y + (Math.random() * positionVariance * 2) - positionVariance

    const text = new Text(damage, { fontFamily: 'monospace', fontSize: isCrit ? 15 : 12 });
    text.anchor.set(0.5);
    // text.position.set(x, y);

    const star = new Graphics();
    star.beginFill(color);
    star.drawCircle(0, 0, isCrit ? 30 : 20);
    star.endFill();

    hitSplatContainer.addChild(star);
    hitSplatContainer.addChild(text);
    // spot.container.addChild(star);
    // spot.container.addChild(text);

    // spot.container.removeChildren();
    // spot.container.addChild(hitSplatContainer);
    spot.available = false;
    spot.age = Date.now();

    UIContainer.addChild(hitSplatContainer);

    const tween = new Ticker();

    const clearSpot = () => {
      // spot.container.removeChildren();
      hitSplatContainer.destroy();
      spot.available = true;
      spot.age = null;
      tween.stop();
    }

    // TODO: improve look of this, but it's okay for now
    // don't let framerate impact the animation either
    tween.add(() => {
      hitSplatContainer.alpha -= 0.01;
      hitSplatContainer.width *= 0.99;
      hitSplatContainer.height *= 0.99;
      hitSplatContainer.y -= 0.5;
      if (hitSplatContainer.alpha <= 0.2) {
        clearSpot();
      }
    })

    tween.start();
  }

  return { spawnHitSplat }
}
