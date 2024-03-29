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
import { MainMenu } from "./Views/MainMenu";
import { UI } from "./UI";
import { GameOver } from "./Views/GameOver";

const SceneStates = {
  MAIN_MENU: "mainMenu",
  PLAYING_GAME: "playingGame",
  GAME_OVER: "gameOver",
}

const createSubjectIncrementFunction = (subject) => (amount = 1) => {
  const currentValue = subject.getValue();
  subject.next(currentValue + amount);
}

export const initializeGameState = () => {
  const sceneState$ = new BehaviorSubject(SceneStates.MAIN_MENU);

  const transitionToScene = (nextScene) => {
    sceneState$.next(nextScene);
  }

  const onSceneChange = (scene, callback) => {
    sceneState$.subscribe(currentScene => {
      if (scene === currentScene) callback();
    })
  }

  // metadata
  const gameVersion = "0.1";
  let time = 0;

  // run stats
  const killCount = new BehaviorSubject({ guards: 0, paladins: 0, total: 0 });
  const damageTaken = new BehaviorSubject(0);
  const reanimations = new BehaviorSubject(0);
  const deanimations = new BehaviorSubject(0);
  const bonesDespawned = new BehaviorSubject(0);
  const minionCount = new BehaviorSubject(0);
  const largestArmy = new BehaviorSubject(0);

  // player
  const playerHealthPercent = new BehaviorSubject(100);
  const playerExpPercent = new BehaviorSubject(0);

  // minions
  const minionAggression = new BehaviorSubject();
  const minionFormation = new BehaviorSubject();

  combineLatest([reanimations, deanimations]).pipe(
    map(([reanimated, deanimated]) => reanimated - deanimated),
    distinctUntilChanged()
  ).subscribe(minionCount);

  minionCount.pipe(
    scan((largestCount, currentCount) => Math.max(largestCount, currentCount), 0),
    distinctUntilChanged()
  ).subscribe(largestArmy);

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

  sceneState$.subscribe(scene => {
    switch (scene) {
      case SceneStates.MAIN_MENU:
        MainMenu({
          onStartGame: () => transitionToScene(SceneStates.PLAYING_GAME),
          gameVersion,
        });
        break;
      case SceneStates.PLAYING_GAME:
        UI({
          killCount,
          minionCount,
          playerHealthPercent,
          playerExpPercent,
          minionFormation,
          minionAggression,
        });
        break;
      case SceneStates.GAME_OVER:
        GameOver({
          gameVersion,
          killCount: killCount.getValue(),
          minionCount: minionCount.getValue(),
          largestArmy: largestArmy.getValue(),
          damageTaken: damageTaken.getValue(),
          reanimations: reanimations.getValue(),
          deanimations: deanimations.getValue(),
          bonesDespawned: bonesDespawned.getValue(),
        })
        break;
    }
  })

  return {
    transitionToScene,
    onSceneChange,
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