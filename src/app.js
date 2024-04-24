import "./style.css"
import { Application, Container, ParticleContainer, Sprite } from "pixi.js";
import { Player } from "./components/Player";
import { TimedSpawner, ExplicitSpawner } from "./components/Enemies";
import { getURLParam } from "./helpers";
import { filter, interval } from "rxjs";
import { initializeMinions } from "./components/Minions";
import { activeKeys$ } from "./components/Inputs";
import { PhysicsUpdate } from "./components/PhysicsUpdate";
import { initializeGameState } from "./gameState";
import { DebugTools } from "./components/DebugTools";
import { spawnItem } from "./components/Drops";
import { Projectile } from "./components/Projectile";

// Setup PixiJS APP
export const appService = {
  /** @type {Application} */
  app: null,
  /** @type {Container} */
  world: null,
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
    // PIXI Dev Tools
    globalThis.__PIXI_APP__ = app;
    container.appendChild(app.view);

    const world = new Container();
    world.x = app.screen.width / 2;
    world.y = app.screen.height / 2;
    const bg = Sprite.from('/assets/testBG.jpg')
    bg.width = 5000;
    bg.height = 5000;
    bg.alpha = 0.4;
    world.addChild(bg);
    bg.anchor.set(0.5);


    const spriteContainer = new Container();
    const UIContainer = new Container();
    const particleContainer = new ParticleContainer();
    spriteContainer.sortableChildren = true;

    world.addChild(spriteContainer);
    world.addChild(UIContainer);
    world.addChild(particleContainer);

    app.stage.addChild(world);
    const gameTicks$ = interval(200);

    window.addEventListener('blur', () => this.softPause());
    window.addEventListener('focus', () => this.softResume());

    activeKeys$.subscribe(keys => {
      if (keys['escape']) {
        this.app.ticker.started ? this.pause() : this.resume();
      }
    });

    this.world = world;
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
    this.paused = false;
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

const { gameTicks$, spriteContainer } = appService;

const gameState = initializeGameState();
appService.physicsUpdate.subscribe(() => {
  // creates a cache for the app to use
  // gameState.separationForceCache.clear();
  // TODO: convert to a Subject instead of updating every frame
  gameState.allUnits = gameState.getAllUnits();
})
export { gameState };

const { createButton } = DebugTools(gameState);

const skeletons = getURLParam("skeletons", 0);
const spawnRate = getURLParam("spawnRate", 5000);

const alignSprites = () => {
  spriteContainer.children.map(c => c.zIndex = c.y);
}
gameTicks$.subscribe(alignSprites);

const initializeGame = () => {
  if (!gameState.debugMode) {
    spawnItem("bones", { x: appService.app.screen.width / 2, y: appService.app.screen.height / 4 }, "start_bones", 0);
    TimedSpawner(spawnRate);
    initializeMinions(skeletons);
  } else {
    const { spawnMinionRandomly } = initializeMinions(skeletons);
    const { createEnemy } = ExplicitSpawner();
  
    createButton("spawn_arrow", "Spawn Arrow", () =>
      Projectile({
        startPos: { x: 50, y: 50 },
        targetPos: gameState.player.sprite,
        name: "arrow",
        viableTargets: [gameState.player, ...gameState.minions],
        onCollide: (target) => target.health?.takeDamage(2)
      })
    );

    createButton("spawn_skeleton", "Spawn Skeleton", () => spawnMinionRandomly(), 20);
    createButton("spawn_peasant", "Spawn Peasant", () => createEnemy("peasant"), 5);
    createButton("spawn_guard", "Spawn Guard", () => createEnemy("guard"), 5);
    createButton("spawn_paladin", "Spawn Paladin", () => createEnemy("paladin"), 5);
    createButton("spawn_archer", "Spawn Archer", () => createEnemy("archer"), 5);
    createButton("spawn_doppelsoldner", "Spawn Doppelsoldner", () => createEnemy("doppelsoldner"), 5);
    createButton("level_player", "Level Up", () => gameState.player.levelUp());
    createButton("immortal_player", "Immortal Player", () =>
      gameState.player.health.subscribeToHealthChange(({ type, amount }) =>
        type === "damage" && gameState.player.health.heal(amount)));
  }
  Player();
}

gameState.onSceneChange("playingGame", initializeGame);
