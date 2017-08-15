import * as path from 'path';
import { AccountDataManager } from './accounts';
import { CharacterClassDataManager } from './classes';
import { CharacterDataManager } from './characters';
import { HallDataManager } from './halls';
import { GuildDataManager } from './guilds';
import { MagicDataManager } from './magic';
import { MapDataManager } from './maps';
import { MonsterDataManager } from './monsters';
import { NpcDataManager } from './npcs';
import { ObjectDataManager } from './objects';
import { PrefixDataManager } from './prefixes';
import { SuffixDataManager } from './suffixes';

export class Data implements Odyssey.Data {
  public readonly managers: any;

  constructor(public readonly dataFolder: string) {
    let dataRoot = dataFolder + path.sep;
    this.managers = {
      'accounts': new AccountDataManager(dataRoot + 'accounts.data'),
      'characters': new CharacterDataManager(dataRoot + 'characters.data'),
      'classes': new CharacterClassDataManager(dataRoot + 'classes.data'),
      'guilds': new GuildDataManager(dataRoot + 'guilds.data'),
      'halls': new HallDataManager(dataRoot + 'halls.data'),
      'magic': new MagicDataManager(dataRoot + 'magic.data'),
      'maps': new MapDataManager(dataRoot + 'maps.data'),
      'monsters': new MonsterDataManager(dataRoot + 'monsters.data'),
      'npcs': new NpcDataManager(dataRoot + 'npcs.data'),
      'objects': new ObjectDataManager(dataRoot + 'objects.data'),
      'prefixes': new PrefixDataManager(dataRoot + 'prefixes.data'),
      'suffixes': new SuffixDataManager(dataRoot + 'suffixes.data')
    }
  }

  getManager(name: string) {
    return this.managers[name];
  }
}
