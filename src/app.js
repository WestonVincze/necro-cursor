import { Application } from "pixi.js";
import { FollowCursor } from "./Minions/followCursor";
import { Player } from "./Player";

// Setup PixiJS APP
const container = document.querySelector('#container');
const app = new Application({ background: '#fafafa', resizeTo: container});
container.appendChild(app.view);

FollowCursor(app, "https://pixijs.com/assets/bunny.png", 10);

Player(app);
  