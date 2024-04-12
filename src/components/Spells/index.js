import { Container, Graphics, Ticker } from "pixi.js";
import { Emitter } from "@pixi/particle-emitter";
import { appService } from "/src/app";
import { explosion } from "/src/VFX/spellFX";

export const RadialSpell = ({
  position = { x: 0, y: 0 },
  growth = 0.5,
  startRadius = 0,
  maxRadius = 50,
  canBeHeld = false,
  onComplete,
  color,
}) => {
  const { UIContainer, particleContainer, physicsUpdate } = appService;

  let emitter = null; 
  let casting = true;

  const circle = new Graphics();
  circle.lineStyle({ width: 2, color })

  let radius = startRadius;
  const getRadius = () => radius;
  circle.beginFill(color, 0.3);
  circle.drawCircle(position.x, position.y, radius);
  circle.endFill();

  UIContainer.addChild(circle);

  const growCircle = () => {
    if (radius >= maxRadius) {
      if (!canBeHeld) resolveSpell();
      return radius;
    }
    circle.clear();
    circle.lineStyle({ width: 2, color });
    radius += growth;
    if (!position.x) {
      // broke game once, cannot seem to reproduce...
      console.error("no position found");
      return;
    }
    circle.beginFill(color, 0.2);
    circle.drawCircle(position.x, position.y, radius);
    circle.endFill();

    return radius;
  }

  const growCircleLoop$ = physicsUpdate.subscribe(growCircle);

  const resolveSpell = () => {
    onComplete?.(radius);
    emitter = new Emitter(particleContainer, explosion({ x: position.x, y: position.y, color, speed: radius * 4 })); 
    emitter.playOnceAndDestroy();
    cancelSpell();
  }

  const cancelSpell = () => {
    growCircleLoop$.unsubscribe();
    casting = false;
    circle.destroy();
  }

  return { casting, resolveSpell, cancelSpell, getRadius };
}

// telegraphed rectangular spell
export const RectangularSpell = (
  position,
  startWith = 0,
  maxWidth= 100,
  height = 10,
  color = 0xaa5555,
  canBeHeld = false,
  onComplete,
  growth = 0.5,
) => {
  const { UIContainer, physicsUpdate } = appService;

  let emitter = null;
  let casting = true;
  let width = startWith;

  const container = new Container();

  const bg = new Graphics();
  bg.lineStyle({ width: 2, color });
  bg.beginFill(color);
  bg.drawRect(position.x, position.y, maxWidth, height);
  bg.endFill();

  const rect = new Graphics();
  rect.beginFill(color, 0.2);
  rect.drawRect(position.x, position.y, width, height);
  rect.endFill();

  container.addChild(bg);
  container.addChild(rect);

  UIContainer.addChild(container);

  const growSpell = () => {
    if (width >= maxWidth) {
      if (!canBeHeld) resolveSpell();
      return width;
    }
    rect.clear();
    width += growth;
    rect.beginFill(color, 0.2);
    rect.drawRect(position.x, position.y, width, height);
    rect.endFill();

    return width;
  }

  const growSpellUpdate$ = physicsUpdate.subscribe(growSpell)

  const resolveSpell = () => {
    onComplete?.(endWidth);
    cancelSpell();
  }

  const cancelSpell = () => {
    growSpellUpdate$.unsubscribe();
    casting = false;
    container.destroy();
  }

  return { casting, resolveSpell, cancelSpell };

}

const SemiCircleSpell = () => {

}
