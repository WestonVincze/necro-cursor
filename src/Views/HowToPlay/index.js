// detailed controls and gameplay mechanics breakdown
/**
 * Player Controls
 * ----------------
 * ## Movement
 * Move the player with WASD
 * Movement is restricted while casting spells
 * 
 * ## Summoning
 * Attempt to summon skeletons by holding spacebar which will slowly increase the summon radius
 * Release spacebar to resolve the spell and summon a minion for every pile of bones within the spell's radius
 * Whenever an enemy or a minion dies, they will leave bones behind but only for a limited time!
 * 
 * ## Game
 * Pause/resume the game with "ESC"
 * Toggle Debug Mode with '`'
 * note: if debug mode is enabled "Start Game" will start the game in a sandbox debug mode
 *
 * 
 * Minion Controls
 * ----------------
 * ## Movement
 * Minions will mainly follow the position of your cursor, but their aggression type and formation will change some of the rules.
 * 
 * ## Aggression Types
 * You can change the aggression type of your minions with "F"
 * Chase Enemies: when a minion is close to an enemy it will follow the enemy until it dies, the aggression type changes, or the enemy moves too far away.
 * 
 * Hold the Line: minions will prioritize following your cursor but still make attacks against enemies within range.
 * 
 * ## Formations
 * You can rotate through the available formations with "Q" and "E"
 * Minions have several formations that they will clumsily try and maintain while following your cursor.
 * 
 * Combat Mechanics
 * -----------------
 * When a unit is within range of its target, it will become an "attacker" and attempt to make attacks while it is in range of its target.
 * The attack roll is a randomly rolled number from 0-20 + the unit's attack bonus.
 * An attack is successful if the resulting roll is greater than the armor of its target.
 * A successful attack will roll damage based on the unit's max hit.
 * A successful attack also has a chance to crit, which will add a multiplier to the damage if successful.
 * Attacks occur at a rate of the unit's attack speed in "ticks" where each tick is 200ms. Therefore, a unit with an attack speed of 5 will attack once every second.
 * Most units have a maximum number of attackers that will prevent units beyond their maximum attackers from attempting attacks.
 * Some units have special abilities that have their own set of rules. For example, Paladins can cast "holy nova" which will deal damage to any of its enemies caught within it.
 * 
 * Stat Breakdown
 * ---------------
 * maxHP: The maximum amount of health a unit can have
 * armor: The minimum value an attack roll needs to be in order to deal damage
 * attackBonus: The bonus value added to an attack roll
 * attackSpeed: The number of "ticks" between the unit's attacks (each tick is 200ms)
 * attackRange: The maximum distance (in pixels) a unit can be from its target in order to make an attack
 * maxHit: The highest value of a unit's base damage roll (0 inclusive)
 * damageBonus: A fixed value added to all damage rolls
 * moveSpeed: How quickly a unit can accelerate (movement force)
 * maxSpeed: The maximum magnitude of a unit's velocity
 * maxAttackers: The maximum number of units that can attack a unit
 * critChance: The percent chance an attack has to be a critical hit
 * critDamage: The damage multiplier of a successful critical hit
 * 
 */
