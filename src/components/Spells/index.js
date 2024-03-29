import { Graphics, Ticker } from "pixi.js";
import { Emitter } from "@pixi/particle-emitter";
import { appService } from "/src/app";
import { explosion } from "/src/VFX/spellFX";

export const RadialSpell = ({
  position = { x: 0, y: 0 },
  growth = 0.5,
  startRadius = 10,
  maxRadius = 50,
  onComplete,
  color,
}) => {
  const { UIContainer, particleContainer } = appService;

  let emitter = null; 
  let casting = true;

  const circle = new Graphics();
  circle.lineStyle({ width: 2, color })
  const ticker = new Ticker();

  let radius = startRadius;
  const getRadius = () => radius;
  circle.drawCircle(position.x, position.y, radius);

  const resolveSpell = () => {
    onComplete?.(radius);
    emitter = new Emitter(particleContainer, explosion({ x: position.x, y: position.y, color, speed: radius * 4 })); 
    emitter.playOnceAndDestroy();
    cancelSpell();
  }

  const cancelSpell = () => {
    ticker.destroy();
    casting = false;
    circle.destroy();
  }

  UIContainer.addChild(circle);

  const growCircle = () => {
    if (radius >= maxRadius) return radius;
    circle.clear();
    circle.lineStyle({ width: 2, color });
    radius += growth;
    if (!position.x) {
      // broke game once, cannot seem to reproduce...
      console.error("no position found");
      return;
    }
    circle.drawCircle(position.x, position.y, radius);

    return radius;
  }

  ticker.add(() => {
    radius = growCircle(position);
  })
  ticker.start();

  return { casting, resolveSpell, cancelSpell, getRadius };
}
