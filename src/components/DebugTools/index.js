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

export const DebugTools = () => {
  const { createButton, toggleConsole } = DebugConsole();
  // setup debug console
  let debugSubscription = null;
  const { gameTicks$ } = appService;

  activeKeys$.subscribe(keys => {
    if (keys['`']) {
      toggleDebug();
    }
  });

  const toggleDebug = () => {
    toggleConsole();
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

  // expose "addDebugBtn" function
  const addDebugBtn = () => {
    createButton()

  }

  return {
    toggleDebug,
    addDebugBtn,
  }

}
