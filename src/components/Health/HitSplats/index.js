import { Container, Graphics, Ticker, Text } from "pixi.js";

const createHitSplatSpots = (container) => {
  const hitSplatSpots = [];
  const numSpots = 4;

  for (let i = 0; i < numSpots; i++) {
    const spotContainer = new Container();
    spotContainer.position.set(50 + i * 150, 50);
    container.addChild(spotContainer);
    hitSplatSpots.push({ container: spotContainer, available: true });
  }

  return hitSplatSpots;
}

/*
export const spawnHitSplat = (damage) => {
  const container = new Container();
  const text = new Text(damage, { style: { fontFamily: 'monospace' }});
  text.anchor.set(0.5);
  const star = new Graphics();
  star.beginFill(damage > 0 ? 0xff5555 : 0x5555ff);
  star.drawCircle(0, 0, 12);
  star.endFill();

  container.addChild(star);
  container.addChild(text);

  return container
}
*/

export const HitSplats = (container) => {
  const spots = createHitSplatSpots(container);
  const getNextSpot = () => spots.find(spot => spot.available);

  const spawnHitSplat = (damage) => {
    const spot = getNextSpot();

    const hitSplatContainer = new Container();

    const text = new Text(damage, { style: { fontFamily: 'monospace' }});
    text.anchor.set(0.5);

    const star = new Graphics();
    star.beginFill(damage > 0 ? 0xff5555 : 0x5555ff);
    star.drawCircle(0, 0, 12);
    star.endFill();

    hitSplatContainer.addChild(star);
    hitSplatContainer.addChild(text);

    spot.container.addChild(hitSplatContainer);
    spot.available = false;

    const tween = new Ticker();
    tween.add(() => {
      hitSplatContainer.alpha -= 0.01;
      if (hitSplatContainer.alpha <= 0) {
        spot.container.removeChild(hitSplatContainer);
        spot.available = true;
        tween.stop();
      }
    })
    tween.start();
  }

  return { spawnHitSplat }
}
