export const HighscoreData = () => {
  const saveHighscore = ({
    gameVersion,
    killCount,
    minionCount,
    largestArmy,
    damageTaken,
    reanimations,
    deanimations,
    bonesDespawned
  }) => {
    const storageKey = `PlayerStats-v${gameVersion}`;
    const oldStats = localStorage.getItem(storageKey);
    const stats = oldStats ? JSON.parse(oldStats) : [];

    stats.push({
      id: stats.length + 1,
      date: Date.now(),
      killCount,
      minionCount,
      largestArmy,
      damageTaken,
      reanimations,
      deanimations,
      bonesDespawned,
    });

    stats.sort((a, b) => b.killCount.total - a.killCount.total)

    localStorage.setItem(storageKey, JSON.stringify(stats));

    return stats;
  }

  const getHighscores = (gameVersion) => {
    const stats = localStorage.getItem(`PlayerStats-v${gameVersion}`);
    return JSON.parse(stats);
  }

  const printHighscores = (count, gameVersion) => {
    const highscores = getHighscores(gameVersion);

    if (!highscores) return `<h2>You don't have any highscores yet!</h2>`

    return `
      <h2>Your Best ${count} Runs</h2>
      ${highscores.slice(0, count).map((hs, i) => `<p>#${i + 1}. Kills: ${hs.killCount.total}, Largest Army: ${hs.largestArmy}</p>`).join("\n")}
    `;
  }

  return { saveHighscore, getHighscores, printHighscores }
}
