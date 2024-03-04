import { appService } from "../app";
import { Graphics, Ticker } from "pixi.js";

export const RadialSpell = ({
  container,
  position = { x: 0, y: 0 },
  growth = 0.5,
  startRadius = 10,
  maxRadius = 50,
  onComplete,
  color,
}) => {
  if (!container) container = appService.UIContainer;

  let casting = true;

  const circle = new Graphics();
  circle.lineStyle({ width: 2, color })

  let radius = startRadius;
  const getRadius = () => radius;
  circle.drawCircle(position.x, position.y, radius);

  const stopCast = () => {
    ticker.destroy();
    casting = false;
    circle.destroy();
    onComplete?.(radius);
  }

  container.addChild(circle);

  const growCircle = () => {
    if (radius >= maxRadius) return radius;
    circle.clear();
    circle.lineStyle({ width: 2, color });
    radius += growth;
    circle.drawCircle(position.x, position.y, radius);

    return radius;
  }

  const ticker = new Ticker();
  ticker.add(() => {
    radius = growCircle(position);
  })
  ticker.start();

  return { casting, stopCast, getRadius };
}
