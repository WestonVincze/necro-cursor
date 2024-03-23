const DebugConsoleScreen = () => `
  <div class=${styles.debugContainer}>
    <button id="spawn_guard">Spawn Guard</button>
    <button id="spawn_paladin">Spawn Paladin</button>
    <button id="spawn_skeleton">Spawn Skeleton</button>
  </div>
`

// TODO: what should be responsible for padding this data to DebugConsole?
export const DebugConsole = ({ spawnGuard, spawnPaladin, spawnSkeleton }) => {
  const container = document.querySelector('#debugContainer');
  container.classList.add('show');
  container.innerHTML = DebugConsoleScreen();

  const spawn_guard_btn = container.querySelector('#spawn_guard');
  const spawn_paladin_btn = container.querySelector('#spawn_paladin');
  const spawn_skeleton_btn = container.querySelector('#spawn_skeleton');

  spawn_guard_btn.addEventListener('click', spawnGuard);
  spawn_paladin_btn.addEventListener('click', spawnPaladin);
  spawn_skeleton_btn.addEventListener('click', spawnSkeleton);
}
