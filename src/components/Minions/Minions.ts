import { BehaviorSubject, auditTime, fromEvent } from 'rxjs'

import { Swarm } from "../Swarm/Swarm";
import { appService, gameState } from "../../app";
import { followTarget } from "../Movement";
import { isIntersectingRect } from "../Colliders";
import { keyDown$ } from "../Inputs";
import { CrossFormationIterator, RandomFormationIterator, SpiralFormationIterator, TriangleFormationIterator } from "./formations";
import { Texture } from "pixi.js";
import { removeItem } from "../Drops";
import { getClosestUnit } from "../../helpers";

const tryEquipItem = (item, unit) => {
  if (unit.itemsHeld.length === 0) {
    unit.itemsHeld.push(item.name);
    removeItem("pickups", item);
    unit.sprite.texture = itemTextures[item.name];
    if (item.name === "great_sword") {
      unit.sprite.height += 70;
    } else if (item.name === "crossbow") {
      unit.sprite.width += 20;
      unit.isRanged = true;
    }
    item.stats.map(stat => unit.addToStat(stat.name, stat.value));
  }
}

const itemTextures = {
  med_helm: Texture.from('/assets/skeleton-med_helm.png'),
  bucket_helm: Texture.from('/assets/skeleton-bucket_helm.png'),
  great_sword:  Texture.from('/assets/skeleton-great_sword.png'),
  crossbow: Texture.from('/assets/skeleton-crossbow.png'),
}

const {
  units: minions,
  addUnit,
  getUnitById,
} = Swarm();

// TODO: Fix performance issues (might be related to high number of containers being used)
export const createMinion = (position) => {
  const minion = addUnit("skeleton", position);

  const findTarget = () => {
    const newTarget = getClosestUnit(minion.sprite, gameState.enemies);
    if (!newTarget) return;
    minion.setTarget(newTarget);
    const targetDeath = newTarget.health.subscribeToDeath(() => {
      if (!getUnitById(minion.id)) return;
      minion.clearTarget();
      targetDeath.unsubscribe();
    });
  }

  findTarget();
  const searchForTarget = appService.gameTicks$.subscribe(findTarget);

  // let's see how the game is with 0% chance to get bones when minion dies
  // if (Math.random() * 100 >= 10) minion.addItemToDrops("bones");

  gameState.incrementReanimations();
  minion.health.subscribeToDeath(() => { 
    searchForTarget.unsubscribe();
    gameState.incrementDeanimations();
  });
}

export const initializeMinions = (spriteCount) => {
  const { app, world, gameTicks$, physicsUpdate } = appService;
  gameState.minions = minions;

  // register mousemove event
  // maybe make this on click?
  const container = document.getElementById("container");
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

  aggressionSubject.subscribe(aggression => gameState.minionAggression.next(aggression));

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
    gameState.items.pickups?.forEach(item => {
      const minion = minions.find(m => isIntersectingRect(item.sprite, m.sprite));
      if (minion) {
        tryEquipItem(item, minion);
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
        followForce: (targetPosition as any).isSprite && isIntersectingRect(minion.sprite, minion.target.sprite, (minion as any).stats.attackRange) ? 0 : 1,
        separation: 2,
        maxSpeed: (minion as any).stats.maxSpeed,
      }

      followTarget(minion.sprite, targetPosition, (minion as any).stats.moveSpeed, delta, options)
    })
  })

  return { spawnMinionRandomly }
}
