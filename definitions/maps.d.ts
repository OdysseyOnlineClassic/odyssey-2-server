declare namespace Odyssey.Maps {
  export enum AttributeType {
    Wall = 1,
    Warp,
    Key,
    Door,
    Keep,
    NoAttack,
    ObjectSpawn,
    TouchPlate,
    Damage,
    NoMonster,
    Script,
    Click,
    Fish,
    Ore,
    ProjectileWall,
    Tree,
    DirectionalWall,
    S,
    Light,
    LightDampening,
    O1,
    O2
  }

  export interface Door {
    attribute: number,
    x: number,
    y: number,
    timestamp: number //TODO is this time? For open/close?
  }

  export interface Layer {
    tile: number,
    alternate: number
  }

  export interface Map {
    name: string,
    exits: {
      up: number,
      down: number,
      left: number,
      right: number
    },
    tiles: Tile[][],
    objects?: MapObject[],
    monsters?: MapMonster[],
    monsterSpawns: MonsterSpawn[],
    doors?: Door,
    bootLocation: Odyssey.Location,
    deathLocation: Odyssey.Location,
    flags: {

    },
    resetTime?: number,
    hall?: number,
    npc: number,
    midi: number,
    keep?: boolean,
    lastUpdate?: number,
    checksum?: number
  }

  export interface MapMonster {
    id: number,
    x: number,
    y: number,
    direction: number,
    target: {
      index: number,
      monster: boolean,
    },
    hp: number,
    attackTimer: number,
    moveTimer: number,
    frame: number
  }

  export interface MapObject {
    objectId: number,
    value: number,
    timestamp: number,
    x: number,
    y: number,
    prefixId: number,
    suffixId: number
  }

  export interface MonsterSpawn {
    monsterId: number,
    rate: number,
    timer: number
  }

  export interface Tile {
    ground: Layer,
    background: Layer,
    foreground: Layer,
    attribute: number,
    attribute2: number,
    attributeData: number[],
    attributeData2?: number[]
  }
}
