import { Container, Graphics, Sprite } from "pixi.js";
import { Emitter } from "@pixi/particle-emitter";
import { appService } from "../../app";
import { explosion } from "../../VFX/spellFX";

interface Spell {
  position: Sprite,// | { x: number, y: number },
  offset?: { x: number, y: number },
  growth?: number,
  color?: string | number,
  canBeHeld?: boolean,
  startSize?: number,
  endSize?: number,
  onComplete?: (size?: number) => void,
  successCondition?: (size?: number) => boolean,
  onSuccess?: (size?: number) => void,
}

export const RadialSpell = ({
  position,
  offset = { x: 0, y: 0 },
  growth = 0.5,
  startSize = 0,
  endSize = 50,
  color,
  canBeHeld = false,
  onComplete,
  successCondition,
  onSuccess,
}: Spell) => {
  const { spriteContainer, particleContainer, physicsUpdate } = appService;

  let emitter = null; 
  let casting = true;
  let size = startSize;

  const circle = new Graphics();

  const updateTelegraph = () => {
    let fill = !successCondition || successCondition(size) ? color : "FFAAAA";
    circle.clear();
    circle.lineStyle({ width: 2, color: fill })
    circle.beginFill(fill, 0.3);
    circle.drawCircle(position.x + offset.x, position.y + offset.y, size);
    circle.endFill();
  }

  spriteContainer.addChild(circle);

  const updateSpell = () => {
    if (size < endSize) {
      size += growth;
      updateTelegraph();
    } else if (!canBeHeld) {
      resolveSpell();
    }

    return size;
  }

  const growCircleLoop$ = physicsUpdate.subscribe(updateSpell);

  const resolveSpell = () => {
    if (!successCondition || successCondition(size)) {
      onSuccess?.(size);
      emitter = new Emitter(particleContainer, explosion({ x: position.x, y: position.y + position.height / 2, color, speed: size * 4 })); 
      emitter.playOnceAndDestroy();
    }
    onComplete?.(size);
    cancelSpell();
  }

  const cancelSpell = () => {
    growCircleLoop$.unsubscribe();
    casting = false;
    circle.destroy();
  }

  return { casting, resolveSpell, cancelSpell };
}

interface RectangularSpellProps extends Spell {
  height?: number,
  target?: Sprite,
}
// telegraphed rectangular spell
export const RectangularSpell = ({
  position,
  offset = { x: 0, y: 0 },
  growth = 0.5,
  startSize = 0,
  endSize = 100,
  height = 30,
  color = 0xaa5555,
  canBeHeld = false,
  onComplete,
  target,
}: RectangularSpellProps) => {
  const { UIContainer, physicsUpdate } = appService;

  let emitter = null;
  let casting = true;
  let width = startSize;

  const container = new Container();
  const bg = new Graphics();
  const rect = new Graphics();

  const updateTelegraph = () => {
    container.position = position
    container.pivot = position 

    bg.clear();
    bg.lineStyle({ width: 2, color });
    bg.beginFill(color, 0.2);
    bg.drawRect(position.x - offset.x, position.y - offset.y - height / 2, endSize, height);
    bg.endFill();

    rect.clear();
    rect.beginFill(color, 0.6);
    rect.drawRect(position.x - offset.x, position.y - offset.y - height / 2, width, height);
    rect.endFill();
  }

  container.addChild(bg);
  container.addChild(rect);
  UIContainer.addChild(container);

  const updateSpell = () => {
    if (width < endSize) {
      width += growth;
      updateTelegraph();
    } else if (!canBeHeld) {
      resolveSpell();
    }

    return width;
  }

  const growSpellUpdate$ = physicsUpdate.subscribe(updateSpell)

  const resolveSpell = () => {
    onComplete(width);
    cancelSpell();
  }

  const cancelSpell = () => {
    growSpellUpdate$.unsubscribe();
    casting = false;
    container.destroy();
  }

  return { casting, resolveSpell, cancelSpell };
}

interface CastBarProps {
  sprite: Sprite,
  onComplete?: (size?: number) => void,
  onSuccess?: (size?: number) => void,
  castTime?: number,
}
export const CastBar = ({ 
  sprite,
  onComplete,
  onSuccess,
  castTime,
}) => {
  const growth = 100 / (castTime * 60);

  const handleComplete = (endWidth) => {
    if (endWidth >= 95) {
      onSuccess();
    } 
    onComplete();
  }

  return RectangularSpell({
    position: sprite,
    offset: { x: sprite.width, y: 50 },
    height: 20,
    onComplete: handleComplete,
    growth,
  })
}

const SemiCircleSpell = () => {

}
