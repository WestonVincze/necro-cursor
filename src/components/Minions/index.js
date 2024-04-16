import { Swarm } from "/src/components/Swarm";
import { appService, gameState } from "/src/app";
import { followTarget } from "/src/components/Movement/followTarget";
import { BehaviorSubject, auditTime, fromEvent } from 'rxjs'
import { isIntersectingRect } from "/src/components/Colliders/isIntersecting";
import { keyDown$ } from "../Inputs";
import { CrossFormationIterator, RandomFormationIterator, SpiralFormationIterator, TriangleFormationIterator } from "./formations";

const {
  units: minions,
  addUnit,
} = Swarm();

// TODO: Fix performance issues (might be related to high number of containers being used)
export const createMinion = (position) => {
  const minion = addUnit("skeleton", position);

  // let's see how the game is with 0% chance to get bones when minion dies
  // if (Math.random() * 100 >= 10) minion.addItemToDrops("bones");

  gameState.incrementReanimations();
  minion.health.subscribeToDeath(() => { 
    gameState.incrementDeanimations();
  });
}

export const initializeMinions = (spriteCount) => {
  const { app, world, gameTicks$, physicsUpdate } = appService;
  gameState.minions = minions;

  // register mousemove event
  // maybe make this on click?
  const move$ = fromEvent(container, 'mousemove');
  const result$ = move$.pipe(auditTime(200));
  const rect = container.getBoundingClientRect();

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  const followMouse = (e) => {
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  gameTicks$.subscribe(() => {
    targetX = mouseX + world.pivot.x - rect.width / 2;
    targetY = mouseY + world.pivot.y - rect.height / 2;
  })

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

        minion.target.removeAttacker();
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

  const spawnMinionRandomly = () => createMinion({ x: Math.random() * app.screen.width, y: Math.random() * app.screen.height })
  for (let i = 0; i < spriteCount; i++) {
    spawnMinionRandomly();
  }

  gameTicks$.subscribe(() => {
    minions.forEach(minion => {
      if (minion.target === null) {
        gameState.enemies.some(enemy => {
          // TODO: change hard coded 100 and 150 values to chase distance
          if (isIntersectingRect(minion.sprite, enemy.sprite, 100) && enemy.addAttacker()) {
            minion.setTarget(enemy);
            enemy.health.subscribeToDeath(() => minion.clearTarget());
            return true;
          }
          return false;
        });
      } else {
        // TODO: make this more obvious?
        const chaseDistance = aggressionSubject.getValue() ? 150 : 100;
        if (!isIntersectingRect(minion.sprite, minion.target.sprite, chaseDistance)) {
          minion.target.removeAttacker();
          minion.clearTarget();
        }
      }
    })
  })

  physicsUpdate.subscribe((delta) => {
    let formationIterator = null;

    const minionCount = minions.length; //filter(minion => !minion.target).length || 0;
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

      if (formationIterator && (!target || !aggressionSubject.getValue())) {
        mod = formationIterator.nextValue();
      }

      const targetPosition = !aggressionSubject.getValue() || !target ? { x: targetX + mod.x, y: targetY + mod.y } : target.sprite;

      const options = {
        followForce: targetPosition.isSprite && isIntersectingRect(minion.sprite, minion.target.sprite, minion.stats.attackRange) ? 0 : 1,
        separation: 2,
        maxSpeed: minion.stats.maxSpeed,
      }

      followTarget(minion.sprite, targetPosition, minion.stats.moveSpeed, delta, options)
    })
  })

  return { spawnMinionRandomly }
}
