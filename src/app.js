import { Application, Container } from "pixi.js";
import { FollowCursor } from "./Minions/followCursor";
import { Player } from "./Player";
import { Spawner } from "./Enemy";
import { getURLParam } from "./helpers";

// Setup PixiJS APP
const container = document.querySelector('#container');
const app = new Application({ background: '#aeaeae', resizeTo: container});
container.appendChild(app.view);

const skeletons = getURLParam("skeletons", 69);
const spawnRate = getURLParam("spawnRate", 2500);

console.log("Change the skeleton count by adding ?skeletons=0 to the url, where 0 is the number of skeletons you want");
console.log("Change the spawn rate of guards by adding ?spawnRate=0 to the url, where 0 is the rate at which guards spawn in miliseconds")
console.log("If you want to add both, separate with an & instead of ? like this: ?skeletons=0&spawnRate=0")

FollowCursor(app, "/assets/skele.png", skeletons);

const enemyContainer = new Container();
app.stage.addChild(enemyContainer);

const player = Player(app);

Spawner(app, enemyContainer, spawnRate, player);
  