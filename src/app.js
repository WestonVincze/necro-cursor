import "./style.css"
import { Application, Container, ParticleContainer } from "pixi.js";
import { Player } from "./components/Player";
import { TimedSpawner, ExplicitSpawner } from "./components/Enemies";
import { getURLParam } from "./helpers";
import { filter, interval } from "rxjs";
import { initializeMinions } from "./components/Minions";
import { activeKeys$ } from "./components/Inputs";
import { PhysicsUpdate } from "./components/PhysicsUpdate";
import { initializeGameState } from "./gameState";

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
  physicsUpdate: null,
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
    });

    this.app = app;
    this.spriteContainer = spriteContainer;
    this.UIContainer = UIContainer;
    this.particleContainer = particleContainer;
    this.gameTicks$ = gameTicks$.pipe(filter(() => this.app.ticker.started));
    this.physicsUpdate = PhysicsUpdate();
    this.physicsUpdate.start();
  },
  softPause() {
    if (this.paused) return;
    this.app.ticker.stop();
    this.physicsUpdate.pause();
  },
  softResume() {
    if (this.paused) return;
    this.app.ticker.start();
    this.physicsUpdate.start();
  },
  pause() {
    this.paused = true;
    this.app.ticker.stop();
    this.physicsUpdate.pause();
  },
  resume() {
    this.app.ticker.start();
    this.physicsUpdate.start();
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

const gameState = initializeGameState();
export { gameState };

const skeletons = getURLParam("skeletons", 3);
const spawnRate = getURLParam("spawnRate", 5000);

initializeMinions(skeletons);

let debugSubscription = null;
const toggleDebug = () => {
  const debug = document.getElementById('FPS');
  const showFPS = (tick) => {
    console.log(tick);
    debug.innerHTML = app.ticker.FPS;
  }
  if (!gameState.debugMode) {
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
  if (!gameState.debugMode) {
    TimedSpawner(spawnRate, player);
  } else {
    ExplicitSpawner(player);
  }
}

gameState.onSceneChange("playingGame", initializeGame);
