import { Application, Container } from "pixi.js";
import { FollowCursor } from "./Minions/followCursor";
import { Player } from "./Player";
import { Spawner } from "./Enemy";
import { getURLParam } from "./helpers";
import { interval } from "rxjs";

// Setup PixiJS APP
export const appService = {
  app: null,
  spriteContainer: null,
  UIContainer: null,
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

    this.app = app;
    this.UIContainer = UIContainer;
    this.spriteContainer = spriteContainer;
    this.gameTicks$ = gameTicks$;
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
  }
}

appService.initialize();
const { gameTicks$, spriteContainer } = appService;

const skeletons = getURLParam("skeletons", 5);
const spawnRate = getURLParam("spawnRate", 2500);

FollowCursor(skeletons);

const player = Player();

Spawner(spawnRate, player);

const alignEnemies = () => {
  spriteContainer.children.map(c => c.zIndex = c.y)
}

gameTicks$.subscribe(() => alignEnemies())
