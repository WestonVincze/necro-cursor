/**
 * === Central source of truth for game state ===
 * * The main purpose of this is to keep state (dependencies) in one location  * *
 * * Components should not import other components functions or state directly * *
 * 
 * contains subjects that the rest of the app can subscribe or push data to
 * 
 * Examples:
 * * killCount => BehaviorSubject
 * * > "Enemies" will push values
 * * > "Player" will access value
 * * > "UI" will listen to value changes
 * 
 * 
 * === Determines what screen to display ===
 * * gameOver => display GameOver screen
 * 
 * === Contains state transition hooks ===
 * * onGameEnd => display stats
 * 
 */

import { BehaviorSubject, combineLatest, distinctUntilChanged, map, scan } from "rxjs";

const createSubjectIncrementFunction = (subject) => (amount = 1) => {
  const currentValue = subject.getValue();
  subject.next(currentValue + amount);
}

export const initializeGameState = () => {
  // metadata
  const gameVersion = "0.1";
  let time = 0;

  // run stats
  const killCount = new BehaviorSubject({ guards: 0, paladins: 0, total: 0 });
  const damageTaken = new BehaviorSubject(0);
  const reanimations = new BehaviorSubject(0);
  const deanimations = new BehaviorSubject(0);
  const bonesDespawned = new BehaviorSubject(0);

  // player
  const playerHealthPercent = new BehaviorSubject(100);
  const playerExpPercent = new BehaviorSubject(0);

  // enemies

  // minions
  const minionAggression = new BehaviorSubject();
  const minionFormation = new BehaviorSubject();

  const minionCount = combineLatest([reanimations, deanimations]).pipe(
    map(([reanimated, deanimated]) => reanimated - deanimated),
    distinctUntilChanged()
  )

  const largestArmy = minionCount.pipe(
    scan((largestCount, currentCount) => Math.max(largestCount, currentCount), 0),
    distinctUntilChanged()
  )

  largestArmy.subscribe(count => console.log("largest army...: " + count))


  const longestTimeNotHit = new BehaviorSubject(0);

  const incrementKillCount = (enemyType) => {
    // TODO: add enemyType validation from data types with a pluralized name property
    const enemy = `${enemyType}s`;
    const currentKills = killCount.getValue();
    killCount.next({ ...currentKills, [enemy]: currentKills[enemy] + 1, total: currentKills.total + 1 });
  }
  const incrementDamageTaken = createSubjectIncrementFunction(damageTaken);
  const incrementReanimations = createSubjectIncrementFunction(reanimations);
  const incrementDeanimations = createSubjectIncrementFunction(deanimations);
  const incrementBonesDespawned = createSubjectIncrementFunction(bonesDespawned);

  bonesDespawned.subscribe((count) => console.log(count))

  return {
    killCount,
    minionCount,
    minionAggression,
    minionFormation,
    largestArmy,
    playerHealthPercent,
    playerExpPercent,
    incrementKillCount,
    incrementDamageTaken,
    incrementReanimations,
    incrementDeanimations,
    incrementBonesDespawned,
  }
}