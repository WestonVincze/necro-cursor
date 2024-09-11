# NECRO CURSOR

Necro Cursor is an experimental POC in which you play as a lowly necromancer who must defend himself from a horde of angry townsfolk. Summon skeletons from the bones of your enemies to defend you and survive as long as you can! 

## Installation Instructions
clone repo

install packages
`npm install`

start the game server
`npm run dev`

## Project Information

PixiJS - rendering engine
RxJS - event management

This project was built with love to experiment with game development using JavaScript. Before starting this project, I only made games using Unity and used JavaScript professionally. My goals were to learn RxJS, merge my professional experience with my passion for game development, and test the limits of browser games. I limited third-party libraries and chose the lightweight rendering engine PixiJS as a self-challenge to better understand game development at a lower level.

This project follows a functional approach and is primarily event-driven, using RxJS to manage the event flow.

### Lessons I learned

#### 1. Event-driven development is a double edged sword.

  What seemed like a strong separation of concerns eventually turned into a maze of dependencies and interactions that were difficult to follow and maintain.

#### 2. Build development tools early. 

While it's often sufficient to test with dev tools, console logs, and breakpoints, invest time on QoL developer experience tools early. 

#### 3. TypeScript is king. 

I started out with vanilla JavaScript for fun and eventually migrated to TypeScript. I used TypeScript for years and had a nostalgic itch to develop using vanilla JavaScript. It was fun at first, but on several occasions I was burned by a tiny bug or typo that TypeScript would have caught early.

#### 4. Don't refactor early.

I challenged myself to develop faster by going against my desire to write "perfect" code. I followed through on this challenge for the most part, but often caught myself "cleaning up" code too early. A POC does not have to be clean; it just has to work.

### What's next?

Necro Cursor served as a great starting point for JavaScript game development and taught me a lot. Play testing was successful overall and I've received plenty of positive feedback. My ambitions for the game have grown and the project is being re-built completely into a new game called [Necro Vs Crown](https://github.com/WestonVincze/necro-vs-crown). You can read more about my decision to re-build the project in the Necro Vs Crown README.

## Before You Play

*_For the best experience play on chrome._*

This game is only a POC and lacks QoL features that will be added in the extended version. It is merely a demo to get a feel for the gameplay loop and test its feasibility.

## Controls

`WASD` - move

`Spacebar` - summon spell

`QE` - change minion formation

`F` - toggle minion auto chase

`ESC` - pause (auto pause also occurs when the window loses focus)

`` ` `` - debug mode (see more below)

## How To Play

### General Gameplay

- You are feeble and cannot attack! Move away from enemies to avoid their attacks
- Stand near bone piles and cast the summon spell to reanimate skeleton minions under your control 
- Minions will follow your cursor, or chase the closest enemy if "auto chase" is toggled
- Gain experience by slaying enemies and choose powerful upgrades when you level up
- Enemies have a chance to drop items that your minions will quickly pick up and use
- When the game ends your highscore and all of your run's stats are saved and can be viewed later from the `Highscore` menu

### Debug/Testing Tools

- Press \` key to enter debug mode
- While enabled the current and lowest FPS are shown in the side panel and all units will display a raycast to their target
  - yellow means the attack is ready, red means the attack is on cooldown
- If debug mode is enabled before `Start Game` is clicked you will enter the playground where you can spawn any number of minions, enemies, projectiles, and enable "god mode"
- Query parameters can be used to modify the game (a query parameter is added to the url with `?{parameter}=` for the first parameter, and `&{parameter}=` for subsequent parameters)
  - `?skeletons=x` will start the game with `x` skeletons
  - `?spawnRate=x` will change the spawn rate of enemies to `x` ms (default is 5000)
  - `?item={itemName}` will spawn the indicated item
    - valid items: bones, bucket_helm, med_helm, great_sword, crossbow
- `Stat Editor` allows you to modify the stats of any unit
  - `load stats` will set all stats to the last saved stat modification
