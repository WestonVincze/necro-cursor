import { Swarm } from "/src/components/Swarm";
import { appService, gameState } from "/src/app";
import { followTarget } from "/src/components/Movement/followTarget";
import { BehaviorSubject, auditTime, fromEvent } from 'rxjs'
import { enemies, addAttacker, removeAttacker } from "/src/components/Enemies";
import { isIntersectingRect } from "/src/components/Colliders/isIntersecting";
import { keyDown$ } from "../Inputs";
import { CrossFormationIterator, RandomFormationIterator, SpiralFormationIterator, TriangleFormationIterator } from "./formations";

const {
  units: minions,
  addUnit,
  getUnitById: getMinionById,
  removeUnit: removeMinion,
} = Swarm();

export { minions, getMinionById, removeMinion }

// TODO: Fix performance issues (might be related to high number of containers being used)
export const createMinion = (position) => {
  const minion = addUnit("skeleton", position, { followTarget: 'cursor' }); // TODO: change to followTarget?
  gameState.incrementReanimations();
  minion.health.subscribeToDeath(() => { 
    gameState.incrementDeanimations();
  });
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

  const formationTypes = [
    "cluttered",
    "spiral",
    "cross",
    "triangleUp",
    "triangleRight",
    "triangleDown",
    "triangleLeft",
    "random",
  ]

  const selectedFormationTypeSubject = new BehaviorSubject({
    value: formationTypes[0],
    index: 0,
  });

  const aggressionSubject = new BehaviorSubject(true);

  const nextFormationType = () => {
    const { index } = selectedFormationTypeSubject.getValue();
    if (index === formationTypes.length - 1) return;

    selectedFormationTypeSubject.next({
      value: formationTypes[index + 1],
      index: index + 1,
    })
  }

  const toggleAggression = () => {
    aggressionSubject.next(!aggressionSubject.getValue());
  }

  const prevFormationType = () => {
    const { index } = selectedFormationTypeSubject.getValue();
    if (index === 0) return;

    selectedFormationTypeSubject.next({
      value: formationTypes[index - 1],
      index: index - 1,
    })
  }

  aggressionSubject.subscribe(aggression => {
    gameState.minionAggression.next(aggression);
    if (!aggression) {
      minions.map(minion => { 
        if (!minion.target) return;

        removeAttacker(minion.target.id);
        minion.clearTarget();
      });
    }
  })

  selectedFormationTypeSubject.subscribe(formation => gameState.minionFormation.next(formation.value));

  keyDown$.subscribe((keyDown) => { 
    if (keyDown.key === 'q') prevFormationType();
    if (keyDown.key === 'e') nextFormationType();
    if (keyDown.key === 'f') toggleAggression();
  })

  result$.subscribe(followMouse);

  const { app, gameTicks$, physicsUpdate } = appService;
  for (let i = 0; i < spriteCount; i++) {
    createMinion({ x: Math.random() * app.screen.width, y: Math.random() * app.screen.height });
  }

  gameTicks$.subscribe(() => {
    minions.forEach(minion => {
      if (minion.target === null) {
        enemies.some(enemy => {
          // TODO: change hard coded 100 and 150 values to chase distance
          if (isIntersectingRect(minion.sprite, enemy.sprite, 100) && addAttacker(enemy.id)) {
            minion.setTarget(enemy);
            enemy.health.subscribeToDeath(() => minion.clearTarget());
            return true;
          }
          return false;
        });
      } else {
        if (!isIntersectingRect(minion.sprite, minion.target.sprite, 150)) {
          removeAttacker(minion.target.id);
          minion.clearTarget();
        }
      }
    })
  })

  physicsUpdate.subscribe((delta) => {
    let formationIterator = null;

    const minionCount = minions.filter(minion => !minion.target).length || 0;
    switch (selectedFormationTypeSubject.getValue().value) {
      case "cluster":
        formationIterator = null;
        break;
      case "spiral":
        formationIterator = SpiralFormationIterator(50);
        break;
      case "cross":
        formationIterator = CrossFormationIterator(25)
        break;
      case "random":
        formationIterator = RandomFormationIterator();
        break;
      case "triangleUp":
        formationIterator = TriangleFormationIterator({
          length: minionCount,
          spacing: 45,
          direction: "up"
        });
        break;
      case "triangleDown":
        formationIterator = TriangleFormationIterator({
          length: minionCount,
          spacing: 45,
          direction: "down"
        });
        break;
      case "triangleRight":
        formationIterator = TriangleFormationIterator({
          length: minionCount,
          spacing: 45,
          direction: "right"
        });
        break;
      case "triangleLeft":
        formationIterator = TriangleFormationIterator({
          length: minionCount,
          spacing: 45,
          direction: "left"
        });
        break;
    }

    let mod = { x: 0, y: 0 };
    minions.forEach(minion => {
      const target = minion.target;

      if (formationIterator && !target) {
        mod = formationIterator.nextValue();
      }

      const targetPosition = !target || !aggressionSubject.getValue() ? { x: targetX + mod.x, y: targetY + mod.y } : target.sprite;
      followTarget(minion.sprite, minions, targetPosition, delta, { followForce: 5, separation: 2 })
    })
  })

  return { createMinion }
}
