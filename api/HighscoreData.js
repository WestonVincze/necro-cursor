export const HighscoreData = () => {
  const saveHighscore = ({ killCount, armySize }) => {
    const oldStats = localStorage.getItem("PlayerStats");
    const stats = oldStats ? JSON.parse(oldStats) : [];

    stats.push({ killCount, armySize });
    stats.sort((a, b) => b.killCount - a.killCount)

    if (stats.length >= 5) {
      stats.pop();
    }

    localStorage.setItem("PlayerStats", JSON.stringify(stats));

    return stats;
  }

  const getHighscores = () => {
    const stats = localStorage.getItem("PlayerStats");
    return JSON.parse(stats);
  }

  return { saveHighscore, getHighscores }
}
