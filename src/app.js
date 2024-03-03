import "./style.css"
import { Application, Container, Sprite } from "pixi.js";
import { FollowCursor } from "./Minions/followCursor";
import { Player } from "./Player";
import { Spawner } from "./Enemies";
import { getURLParam } from "./helpers";
import { filter, from, interval } from "rxjs";
import { GameStart } from "./Views/GameStart";

// Setup PixiJS APP
export const appService = {
  /** @type {Application} */
  app: null,
  /** @type {Container} */
  spriteContainer: null,
  /** @type {Container} */
  UIContainer: null,
  /** @type {interval} */
  gameTicks$: null,
  initialize() {
    const container = document.querySelector('#container');
    const app = new Application({ background: '#aeaeae', resizeTo: container});
    container.appendChild(app.view);

    const UIContainer = new Container();
    const spriteContainer = new Container();
    spriteContainer.sortableChildren = true;

    app.stage.addChild(spriteContainer);
    app.stage.addChild(UIContainer);
    const gameTicks$ = interval(200);

    window.addEventListener('blur', () => this.pause());
    window.addEventListener('focus', () => this.resume());

    this.app = app;
    this.UIContainer = UIContainer;
    this.spriteContainer = spriteContainer;
    this.gameTicks$ = gameTicks$.pipe(filter(() => this.app.ticker.started));
  },
  pause() {
    this.app.ticker.stop();
  },
  resume() {
    // when we add "pausing" we'll want to make sure we don't auto resume when we refocus on a deliberately paused game
    this.app.ticker.start();
  },
  /** do we need getters? */
  getApp() {
    return this.app;
  },
  getSpriteContainer() {
    return this.spriteContainer;
  },
  getUIContainer() {
    return this.UIContainer;
  },
  getGameTicks$() {
    return this.gameTicks$;
  },
}

appService.initialize();

const { gameTicks$, spriteContainer } = appService;

const skeletons = getURLParam("skeletons", 3);
const spawnRate = getURLParam("spawnRate", 4000);

FollowCursor(skeletons);

/*
const showGameTicks = (v) => {
  console.log(v);
}
gameTicks$.subscribe(showGameTicks)
*/

const alignSprites = () => {
  spriteContainer.children.map(c => c.zIndex = c.y);
}

gameTicks$.subscribe(alignSprites);

const initializeGame = () => {
  const player = Player();
  Spawner(spawnRate, player);
}

GameStart({ onStartGame: initializeGame });


/**
 * GAME MANAGER
 * 
 * Game State?
 * > Menu
 *   - Play Game
 *   - HighScores
 * > Options
 *   - initial state form
 * > Character Select
 *   - selecting character avatar
 * > Playing
 *   - game is active
 * > Paused
 *   - pause menu shown
 * > Death Screen
 *   - YOU DIED message + stats
 *   - save stats in localstorage
 */

