import { Swarm } from "/src/components/Swarm";
import { minionData } from "/src/data/units";
import { appService, setMinionCountUI } from "/src/app";
import { followTarget } from "/src/components/Movement/followTarget";
import { auditTime, fromEvent } from 'rxjs'
import { enemies, addAttacker } from "/src/components/Enemies";
import { isIntersectingRect } from "/src/components/Colliders/isIntersecting";

const {
  units: minions,
  createUnit,
  getUnitById: getMinionById,
  removeUnit: removeMinion,
} = Swarm();

export { minions, getMinionById, removeMinion }

// TODO: Fix performance issues (might be related to high number of containers being used)
export const createMinion = (position) => {
  const minion = createUnit(minionData.skeleton, position, { target: 'cursor' });
  setMinionCountUI(minions.length);
  minion.health.subscribeToDeath(() => setMinionCountUI(minions.length));

}

export const initializeMinions = (spriteCount) => {
  // register mousemove event
  const move$ = fromEvent(container, 'mousemove');
  const result$ = move$.pipe(auditTime(200));

  let targetX = 0;
  let targetY = 0;

  const followMouse = (e) => {
    const rect = container.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
  }

  result$.subscribe(followMouse);

  const { app, gameTicks$ } = appService;
  for (let i = 0; i < spriteCount; i++) {
    createMinion({ x: Math.random() * app.screen.width, y: Math.random() * app.screen.height });
  }

  gameTicks$.subscribe(() => {
    minions.forEach(minion => {
      // only check minions that are not busy
      if (minion.target === 'cursor') {
        enemies.some(enemy => {
          if (isIntersectingRect(minion.sprite, enemy.sprite, 100) && addAttacker(enemy.id)) {
            minion.target = enemy.sprite;
            enemy.health.subscribeToDeath(() => minion.target = "cursor");
            return true;
          }
          return false;
        });
      }
    })
  })

  app.ticker.add((delta) => {
    minions.forEach(minion => {
      const target = minion.target === 'cursor' ? { x: targetX, y: targetY } : minion.target;

      followTarget(minion.sprite, minions, target, delta, { followForce: 0.01, separation: 2 })
    })
  })
}
