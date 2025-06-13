import * as migration_20250613_071949 from './20250613_071949';

export const migrations = [
  {
    up: migration_20250613_071949.up,
    down: migration_20250613_071949.down,
    name: '20250613_071949'
  },
];
