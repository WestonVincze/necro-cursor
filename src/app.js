import { Application } from "pixi.js";
import { FollowCursor } from "./Minions/followCursor";
import { Player } from "./Player";

// Setup PixiJS APP
const container = document.querySelector('#container');
const app = new Application({ background: '#aeaeae', resizeTo: container});
container.appendChild(app.view);

FollowCursor(app, "/assets/skele.png", 50);

Player(app);
  