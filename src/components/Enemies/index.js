import { interval } from "rxjs";
import { followTarget } from "/src/components/Movement/followTarget";
import { appService, gameState } from "/src/app";
import { Swarm } from "/src/components/Swarm";
import { enemyData } from "/src/data/units";
import { RadialSpell } from "/src/components/Spells";
import { distanceBetweenPoints } from "/src/components/Colliders/isIntersecting";
import { getClosestUnit } from "../../helpers";
import { isIntersectingRect } from "../Colliders/isIntersecting";

const {
  units: enemies,
  addUnit,
  getUnitById,
} = Swarm();

const createEnemy = (name, position = {
        x: Math.random() < 0.5 ? Math.random() * 100 : appService.app.screen.width - Math.random() * 100,
        y: Math.random() < 0.5 ? Math.random() * 100 : appService.app.screen.height - Math.random() * 100,
    }) => {

  position.x += appService.world.pivot.x - appService.app.screen.width / 2;
  position.y += appService.world.pivot.y - appService.app.screen.height / 2;
  const enemy = addUnit(name, position);

  const findTarget = () => {
    const newTarget = getClosestUnit(enemy.sprite, gameState.minions.concat(gameState.player));
    enemy.setTarget(newTarget);
    newTarget.health.subscribeToDeath(() => {
      if (!getUnitById(enemy.id)) return;
      findTarget();
    });
  }

  findTarget();
  const searchForTarget = appService.gameTicks$.subscribe(findTarget);

  /*
  enemy.health.subscribeToHealthChange(({ type }) => {
    if (type !== "damage") return;

    const newTarget = getClosestUnit(enemy.sprite, gameState.minions);
    enemy.setTarget(newTarget);
    newTarget.health.subscribeToDeath(() => {
      if (!getUnitById(enemy.id)) return;
      enemy?.setTarget(gameState.player)}
    );
  });
  */

  enemy.health.subscribeToDeath(() => {
    searchForTarget.unsubscribe();
    gameState.incrementKillCount(enemy.name);
    gameState.player.addExperience(enemyData[name].exp);

    if (enemy.name === "paladin" && enemy.holyNova) {
      enemy.holyNova.cancelSpell();
    }
  })
}

const Enemies = () => {
  gameState.enemies = enemies;
  const { physicsUpdate } = appService;
  physicsUpdate.subscribe((delta) => {
    enemies.forEach(enemy => {
      if (enemy.name === "paladin") {
        if (Math.random() > 0.99 && !enemy.holyNova) {
          enemy.holyNova = RadialSpell({
            position: enemy.sprite,
            growth: 0.15,
            endRadius: 70,
            color: "FFFF55",
            onComplete: (radius) => {
              if (!enemy.sprite.destroyed) {
                if (distanceBetweenPoints(gameState.player.sprite, enemy.sprite) <= radius) {
                  gameState.player.health.takeDamage(5);
                }
                gameState.minions.map(minion => {
                  if (distanceBetweenPoints(minion.sprite, enemy.sprite) <= radius) {
                    minion.health.takeDamage(5);
                  }
                })
              }
              enemy.holyNova = null;
            }
          })
        }
      } 

      const options = {
        followForce: isIntersectingRect(enemy.sprite, enemy.target.sprite, enemy.stats.attackRange) ? 0 : 1,
        separation: 2,
        maxSpeed: enemy.stats.maxSpeed,
      }

      followTarget(enemy.sprite, enemy.target.sprite, enemy.stats.moveSpeed, delta, options);
    })
  })
}

export const ExplicitSpawner = () => {
  Enemies();

  return { createEnemy };
}

// continuously spawns enemies
export const TimedSpawner = (rate = 5000) => {
  const { app } = appService;
  const timer$ = interval(rate);

  Enemies();

  let difficultyScale = 1;

  timer$.subscribe(() => {
    if (!app.ticker.started) return;
    difficultyScale += 0.02;
    console.log(difficultyScale);

    for (let i = 0; i < Math.floor(difficultyScale); i++) {
      const name = decideEnemyToSpawn(difficultyScale);
      createEnemy(name);
    }
  })
}

// TODO: refactor the hell out of this trash
const decideEnemyToSpawn = (scale) => {
  const randomRoll = Math.random();

  // only peasants
  if (scale < 1.3) return "peasant";

  // 50% peasants, 50% guards
  if (scale < 1.8 && randomRoll > 0.5) return "peasant"; 

  // 30% paladin
  if (scale > 2 && randomRoll <= 0.3) return "paladin";

  // 10% - 30% archer
  if (scale > 2.3 && randomRoll >= Math.max(0.7, 0.9 - (scale - 2.3) / 10)) return "archer";

  // 10% - 30% doppelsolder
  if (scale > 2.6 && randomRoll >= Math.max(0.4, 0.8 - (scale - 2.6) / 5)) return "doppelsoldner";

  // 70% - 10% guard
  return "guard";
}
