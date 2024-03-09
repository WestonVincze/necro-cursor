import "./style.css"
import { Application, Container, ParticleContainer } from "pixi.js";
import { Player } from "./Player";
import { Spawner } from "./Enemies";
import { getURLParam } from "./helpers";
import { filter, interval } from "rxjs";
import { MainMenu } from "./Views/MainMenu";
import { initializeMinions } from "./Minions";
import { activeKeys$ } from "./Inputs";

// Setup PixiJS APP
export const appService = {
  /** @type {Application} */
  app: null,
  /** @type {Container} */
  spriteContainer: null,
  /** @type {Container} */
  UIContainer: null,
  /** @type {ParticleContainer} */
  particleContainer: null,
  /** @type {interval} */
  gameTicks$: null,
  paused: false,
  initialize() {
    const container = document.querySelector('#container');
    const app = new Application({ background: '#aeaeae', resizeTo: container});
    container.appendChild(app.view);

    const spriteContainer = new Container();
    const UIContainer = new Container();
    const particleContainer = new ParticleContainer();
    spriteContainer.sortableChildren = true;

    app.stage.addChild(spriteContainer);
    app.stage.addChild(UIContainer);
    app.stage.addChild(particleContainer);
    const gameTicks$ = interval(200);

    window.addEventListener('blur', () => this.softPause());
    window.addEventListener('focus', () => this.softResume());

    activeKeys$.subscribe(keys => {
      if (keys['escape']) {
        this.app.ticker.started ? this.pause() : this.resume();
      }

      if (keys['`']) {
        toggleDebug();
      }
    });

    this.app = app;
    this.spriteContainer = spriteContainer;
    this.UIContainer = UIContainer;
    this.particleContainer = particleContainer;
    this.gameTicks$ = gameTicks$.pipe(filter(() => this.app.ticker.started));
  },
  softPause() {
    if (this.paused) return;
    this.app.ticker.stop();
  },
  softResume() {
    if (this.paused) return;
    this.app.ticker.start();
  },
  pause() {
    this.paused = true;
    this.app.ticker.stop();
  },
  resume() {
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

const { app, gameTicks$, spriteContainer } = appService;

const skeletons = getURLParam("skeletons", 3);
const spawnRate = getURLParam("spawnRate", 5000);

initializeMinions(skeletons);

/*
const showGameTicks = (v) => {
  console.log(v);
}
gameTicks$.subscribe(showGameTicks)
*/

let debugSubscription = null;
const toggleDebug = () => {
  const debug = document.getElementById('debug');
  const showFPS = () => debug.innerHTML = app.ticker.FPS;
  if (debug.innerHTML === "") {
    debugSubscription = gameTicks$.subscribe(showFPS);
  } else {
    debugSubscription.unsubscribe();
    debug.innerHTML = "";
  }
}

const alignSprites = () => {
  spriteContainer.children.map(c => c.zIndex = c.y);
}

gameTicks$.subscribe(alignSprites);

const initializeGame = () => {
  const player = Player();
  Spawner(spawnRate, player);
}

MainMenu({ onStartGame: initializeGame });


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

