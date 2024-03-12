import { Swarm } from "/src/components/Swarm";
import { minionData } from "/src/data/units";
import { appService, setMinionCountUI } from "/src/app";
import { followTarget } from "/src/components/Movement/followTarget";
import { BehaviorSubject, auditTime, fromEvent } from 'rxjs'
import { enemies, addAttacker, removeAttacker } from "/src/components/Enemies";
import { isIntersectingRect } from "/src/components/Colliders/isIntersecting";
import { keyDown$ } from "../Inputs";
import { PlusFormationIterator, SpiralFormationIterator } from "./formations";

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

  // TODO: add different types of skeleton formations
  // split "aggression" and "formation" into separate variables
  const formationTypes = [
    "cluttered",
    "spiral",
    "plus",
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

  const prevControlType = () => {
    const { index } = selectedFormationTypeSubject.getValue();
    if (index === 0) return;

    selectedFormationTypeSubject.next({
      value: formationTypes[index - 1],
      index: index - 1,
    })
  }

  aggressionSubject.subscribe(aggressive => {
    if (!aggressive) {
      minions.map(m => { 
        if (m.target === "cursor") return;
        removeAttacker(m.target.id);
        m.target = "cursor";
      });
    }
  })

  keyDown$.subscribe((keyDown) => { 
    if (keyDown.key === 'q') prevControlType();
    if (keyDown.key === 'e') nextFormationType();
    if (keyDown.key === 'f') toggleAggression();
  })

  result$.subscribe(followMouse);

  const { app, gameTicks$ } = appService;
  for (let i = 0; i < spriteCount; i++) {
    createMinion({ x: Math.random() * app.screen.width, y: Math.random() * app.screen.height });
  }

  gameTicks$.subscribe(() => {
    if (!aggressionSubject.getValue()) return;

    minions.forEach(minion => {
      // only check minions that are not busy
      if (minion.target === 'cursor') {
        enemies.some(enemy => {
          if (isIntersectingRect(minion.sprite, enemy.sprite, 100) && addAttacker(enemy.id)) {
            minion.target = enemy;
            enemy.health.subscribeToDeath(() => minion.target = "cursor");
            return true;
          }
          return false;
        });
      }
    })
  })

  app.ticker.add((delta) => {
    let formationIterator = null;

    switch (selectedFormationTypeSubject.getValue().value) {
      case "cluster":
        formationIterator = null;
        break;
      case "spiral":
        formationIterator = SpiralFormationIterator(50);
        break;
      case "plus":
        formationIterator = PlusFormationIterator(15)
        break;
    }
    let mod = { x: 0, y: 0 };
    minions.forEach(minion => {
      if (formationIterator) {
        mod = formationIterator.nextValue();
        console.log(mod);
      }
      const target = minion.target === 'cursor' ? { x: targetX + mod.x, y: targetY + mod.y } : minion.target.sprite;
      followTarget(minion.sprite, minions, target, delta, { followForce: 0.01, separation: 2 })
    })
  })
}
