/**
 * Toggle-able debug mode with `
 * -> modify game state "debugMode"?
 * 
 * Inner debug tooling actions
 * -> show gizmos
 * 
 * Allow other components to register "Debug Actions"
 * -> debugButton = creates a UI button and maps onclick to callback
 * 
 */

import { DebugConsole } from "../../Views/DebugConsole";
import { appService } from "../../app";
import { activeKeys$ } from "../Inputs";

export const DebugTools = (gameState) => {
  const { createButton, toggleConsole } = DebugConsole();
  // setup debug console
  let debugSubscription = null;
  const { app, gameTicks$ } = appService;

  // setup toggle debug mode
  activeKeys$.subscribe(keys => {
    if (keys['`']) {
      toggleDebug();
    }
  });

  const toggleDebug = () => {
    toggleConsole();
    const FPS = document.getElementById('FPS');
    const showFPS = (tick) => {
      // console.log(tick);
      FPS.innerHTML = Math.round(app.ticker.FPS);
    }
    if (!gameState.debugMode) {
      debugSubscription = gameTicks$.subscribe(showFPS);
    } else {
      debugSubscription.unsubscribe();
    }
    // TODO: this should probably be a subject...
    gameState.debugMode = !gameState.debugMode;
  }

  return {
    toggleDebug,
    createButton,
  }
}
