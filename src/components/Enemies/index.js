import { interval } from "rxjs";
import { followTarget } from "/src/components/Movement/followTarget";
import { appService, gameState } from "/src/app";
import { Swarm } from "/src/components/Swarm";
import { enemyData } from "/src/data/units";
import { RadialSpell } from "/src/components/Spells";
import { distanceBetweenPoints } from "/src/components/Colliders/isIntersecting";
import { getClosestUnit } from "../../helpers";

const {
  units: enemies,
  addUnit,
  getUnitById,
} = Swarm();

const createEnemy = (type, position) => {
  const enemy = addUnit(type, position);
  enemy.setTarget(gameState.player);

  enemy.health.subscribeToHealthChange(({ type }) => {
    if (type !== "damage") return;

    const newTarget = getClosestUnit(enemy.sprite, gameState.minions);
    enemy.setTarget(newTarget);
    newTarget.health.subscribeToDeath(() => {
      if (!getUnitById(enemy.id)) return;
      enemy?.setTarget(gameState.player)}
    );
  });

  enemy.health.subscribeToDeath(() => {
    gameState.incrementKillCount(enemy.name);
    gameState.player.addExperience(enemyData[type].exp);

    if (enemy.name === "paladin" && enemy.holyNova) {
      enemy.holyNova.cancelSpell();
    }
  })

  // TODO: refactor into proper damage system
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
            growth: 0.1,
            maxRadius: 100,
            color: "FFFF55",
            onComplete: (radius) => {
              if (!enemy.sprite.destroyed) {
                if (distanceBetweenPoints(gameState.player.sprite, enemy.sprite) <= radius) {
                  gameState.player.health.takeDamage(10);
                }
                gameState.minions.map(minion => {
                  if (distanceBetweenPoints(minion.sprite, enemy.sprite) <= radius) {
                    minion.health.takeDamage(10);
                  }
                })
              }
              enemy.holyNova = null;
            }
          })
        }
        if (enemy.holyNova?.getRadius() >= 100) enemy.holyNova.resolveSpell();
      } 

      const options = {
        followForce: 1,
        separation: 2,
        maxSpeed: enemy.stats.maxSpeed,
        closeEnough: enemy.target ? { x: enemy.target.sprite.width, y: enemy.target.sprite.height } : null
      }
      followTarget(enemy.sprite, enemy.target.sprite, enemy.stats.moveSpeed, delta, options);
    })
  })
}

export const ExplicitSpawner = () => {
  const { app } = appService;
  Enemies();

  // spawns enemies on demand only
  const spawnEnemy = (name) => {
    createEnemy(
      name,
      {
        x: Math.random() < 0.5 ? Math.random() * 100 : app.screen.width - Math.random() * 100,
        y: Math.random() < 0.5 ? Math.random() * 100 : app.screen.height - Math.random() * 100,
      }
    )
  }

  return { spawnEnemy }
}

// continuously spawns enemies
export const TimedSpawner = (rate = 5000) => {
  const { app } = appService;
  const timer$ = interval(rate);

  Enemies();

  let difficultyScale = 1;

  timer$.subscribe(() => {
    if (!app.ticker.started) return
    difficultyScale += 0.1;

    for (let i = 0; i < Math.floor(difficultyScale); i++) {
      createEnemy(
        Math.random() > Math.min(0.5, (0.05 * difficultyScale)) ? "guard" : "paladin",
        {
          x: Math.random() < 0.5 ? Math.random() * 600 : app.screen.width - Math.random() * 600,
          y: Math.random() < 0.5 ? Math.random() * 600 : app.screen.height - Math.random() * 600,
        }
      )
    }
  })
}
