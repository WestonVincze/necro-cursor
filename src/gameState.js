/**
 * === Central source of truth for game state ===
 * * The main purpose of this is to keep state (dependencies) in one location  * *
 * * Components should not import other components functions or state directly * *
 * 
 * 
 * contains subjects that the rest of the app can subscribe or push data to
 * 
 * Examples:
 * * killCount => BehaviorSubject
 * * > "Enemies" will push values
 * * > "Player" will access value
 * * > "UI" will listen to value changes
 * 
 * 
 * === Determines what screen to display ===
 * * gameOver => display GameOver screen
 * 
 * === Contains state transition hooks ===
 * * onGameEnd => display stats
 * 
 */