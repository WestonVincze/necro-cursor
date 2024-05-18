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

  let lowestFPS = Infinity;

  const toggleDebug = () => {
    toggleConsole();
    const FPS = document.getElementById('FPS');
    const lowestFPSElement = document.getElementById('lowestFPS');
    const showFPS = () => {
      FPS.innerHTML = Math.round(app.ticker.FPS).toString();
      lowestFPSElement.innerHTML = lowestFPS.toString();
    }
    if (!gameState.debugMode) {
      if (!(window as any).gameState) (window as any).gameState = gameState;
      debugSubscription = gameTicks$.subscribe(showFPS);
      app.ticker.add(() => {
        const currentFPS = Math.round(app.ticker.FPS)
        if (currentFPS < lowestFPS) {
          lowestFPS = currentFPS
        }
      })
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
