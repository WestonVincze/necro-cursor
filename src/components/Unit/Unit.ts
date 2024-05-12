import { Graphics, Sprite } from "pixi.js"
import { appService, gameState } from "../../app";
import { Health } from "../Health";
import { isIntersectingRect } from "../Colliders/isIntersecting";
import { attackTarget } from "../Attack";
import { Stats, units } from "../../data/units";
import { take, finalize } from "rxjs";
import { spawnDrops } from "../Drops";
import { Projectile } from "../Projectile";

export interface Unit {
  id: string,
  name: string,
  level: number,
  sprite: Sprite,
  health: any, // TODO: add Health type
  getStats: () => Stats,
  addToStat: (stat: string, value: string) => void,
  setTarget: (target: Unit) => void
  clearTarget: () => void,
  addItemToDrops: (item: any) => void, // TODO: add Item type
}

export const createUnit = (id: string, unitName: string, position: {x: number, y: number}): Unit => {
  const _unitData = units[unitName];
  if (!_unitData) {
    console.error(`${unitName} is not a valid unit.`); 
    return;
  }

  const { gameTicks$, spriteContainer, UIContainer } = appService;
  const _stats = _unitData.stats;
  const _dropTable = _unitData.dropTable || {};
  const _statOverrides = {};
  let _isRanged = _unitData.ranged;
  let _targetTypes = null; // array of possible target types (not being used yet)
  let _target = null; // unit or null
  let _canAttack = _stats.maxHit > 0; // always false if there is no max hit
  let _attackers = 0;
  const _itemsHeld = [];

  const getStats = () => ({ ..._stats, ..._statOverrides });

  let level = 0;

  // configure sprite
  let sprite = null;

  sprite = Sprite.from(_unitData.url);
  sprite.width = _unitData.width;
  sprite.height = _unitData.height;
  sprite.anchor.set(0.5);

  sprite.position.set(position.x, position.y);
  sprite.vx = 0;
  sprite.vy = 0;
  sprite.id = id; // is this dumb?
  spriteContainer.addChild(sprite);

  const health = Health({ maxHP: getStats().maxHP, sprite, hideHealthBar: _unitData.hideUI, type: _unitData.type });

  health.subscribeToDeath(() => {
    spawnDrops(sprite, _dropTable);
  })

  if (getStats().HPregeneration > 0 ) {
    gameTicks$.subscribe(() => {
      health.heal(getStats().HPregeneration);
    })
  }

  const checkForStat = (stat) => {
    if (!_stats.hasOwnProperty(stat)) {
      console.error(`Invalid stat: ${stat}`);
      return false;
    }

    return true;
  }

  // TODO: all of these modify the original reference, when we want to be able to modify stats at the unit level we will need to change these to modify the "_statOverrides" property and move these functions out of each unit
  const setStat = (stat, value) => {
    if (!checkForStat(stat)) return;

    _statOverrides[stat] = value;
  }

  const addToStat = (stat, value) => {
    if (!checkForStat(stat)) {
      console.error(`${stat} not found.`)
      return;
    }

    const newValue = (_statOverrides[stat] || _stats[stat]) + value;

    _statOverrides[stat] = Math.round(newValue * 100) / 100;
  }

  // finds the closest available target or returns null if none found
  // run every tick?
  const assignClosestTarget = (type) => {
    if (!_targetTypes) {
      console.error("No target type set.");
      return;
    }

    // search game state for targetType... assign closest potential target to _target
  }

  let attackTicks = null;
  const setTarget = (target) => {
    if (_target?.id === target.id) return;
    _target = target;
    attackTicks?.complete();
    attackTicks = gameTicks$.subscribe(() => tryAttack());
  }

  const clearTarget = () => {
    attackTicks?.complete();
    _target = null;
    attackTicks = null;
    line.clear();
  }

  health.subscribeToDeath(() => clearTarget());

  const line = new Graphics();
  UIContainer.addChild(line);
  const tryAttack = () => {
    // check if can attack and target is set
    line.clear();
    if (gameState.debugMode) {
      line.lineStyle({ width: 2, color: _canAttack ? 0xffff55 : 0xff5555 });
      line.moveTo(sprite?.x, sprite?.y);
      line.lineTo(_target?.sprite?.x, _target?.sprite?.y);
      line.endFill();
    }

    if (!_canAttack || _target === null || !_target.sprite || !sprite) return;

    // check if in range
    if(!isIntersectingRect(sprite, _target.sprite, getStats().attackRange)) return;

    if (_isRanged) {
      Projectile({
        startPos: sprite,
        targetPos: _target.sprite,
        name: "arrow",
        viableTargets: _unitData.type === "enemy" ? [gameState.player, ...gameState.minions] : gameState.enemies,
        onCollide: (target) => attackTarget(getStats(), target),
      })
    } else {
      attackTarget(getStats(), _target);
    }

    _canAttack = false;
    // TODO: check for potential memory leaks here
    gameTicks$
      .pipe(
        take(getStats().attackSpeed + 1),
        finalize(() => _canAttack = true),
      ).subscribe();
  }

  const addItemToDrops = (item) => {
    if (!_dropTable.always) {
      _dropTable.always = [];
    }
    _dropTable.always.push(item);
  }

  const unit = {
    id,
    name: unitName,
    level, // TODO: encapsulate this?
    sprite,
    health,
    getStats, // TODO: fix "stats" definition so that player doesn't have to call this function...
    addToStat,
    setStat,
    setTarget,
    clearTarget,
    addItemToDrops,
  }

  // define public accessors
  Object.defineProperties(unit, {
    target: {
      get: () => _target,
      enumerable: true,
    },
    stats: {
      get: getStats,
      enumerable: true,
    },
    targetType: {
      get: () => _targetTypes,
      enumerable: true,
    },
    attackers: {
      get: () => _attackers,
      enumerable: true,
    },
    itemsHeld: {
      get: () => _itemsHeld,
      enumerable: true
    },
    isRanged: {
      get: () => _isRanged,
      set: (v) => _isRanged = v,
      enumerable: true,
    }
  })

  return unit;
}