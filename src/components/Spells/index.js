import { Container, Graphics } from "pixi.js";
import { Emitter } from "@pixi/particle-emitter";
import { appService } from "/src/app";
import { explosion } from "/src/VFX/spellFX";

export const RadialSpell = ({
  position = { x: 0, y: 0 },
  growth = 0.5,
  startRadius = 0,
  endRadius = 50,
  color,
  canBeHeld = false,
  onComplete,
}) => {
  const { UIContainer, particleContainer, physicsUpdate } = appService;

  let emitter = null; 
  let casting = true;
  let radius = startRadius;

  const circle = new Graphics();

  const updateTelegraph = () => {
    circle.clear();
    circle.lineStyle({ width: 2, color })
    circle.beginFill(color, 0.3);
    circle.drawCircle(position.x, position.y, radius);
    circle.endFill();
  }

  UIContainer.addChild(circle);

  const updateSpell = () => {
    if (radius < endRadius) {
      radius += growth;
      updateTelegraph();
    } else if (!canBeHeld) {
      resolveSpell();
    }

    return radius;
  }

  const growCircleLoop$ = physicsUpdate.subscribe(updateSpell);

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

  return { casting, resolveSpell, cancelSpell };
}

// telegraphed rectangular spell
export const RectangularSpell = ({
  position,
  growth = 0.5,
  startWith = 0,
  endWidth = 100,
  height = 30,
  color = 0xaa5555,
  canBeHeld = false,
  onComplete,
  target,
}) => {
  const { UIContainer, physicsUpdate } = appService;
  console.log(target);

  let emitter = null;
  let casting = true;
  let width = startWith;

  const container = new Container();
  const bg = new Graphics();
  const rect = new Graphics();

  const updateTelegraph = () => {
    container.position = position
    container.pivot = position 

    bg.clear();
    bg.lineStyle({ width: 2, color });
    bg.beginFill(color, 0.2);
    bg.drawRect(position.x, position.y - height / 2, endWidth, height);
    bg.endFill();

    rect.clear();
    rect.beginFill(color, 0.6);
    rect.drawRect(position.x, position.y - height / 2, width, height);
    rect.endFill();
  }

  container.addChild(bg);
  container.addChild(rect);
  UIContainer.addChild(container);

  const updateSpell = () => {
    if (width < endWidth) {
      width += growth;
      updateTelegraph();
    } else if (!canBeHeld) {
      resolveSpell();
    }

    return width;
  }

  const growSpellUpdate$ = physicsUpdate.subscribe(updateSpell)

  const resolveSpell = () => {
    onComplete(endWidth);
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
