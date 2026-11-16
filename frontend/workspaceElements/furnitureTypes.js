import { couch } from './furniture/couch.js';
import { table } from './furniture/table.js';
import { chair } from './furniture/chair.js';
import { bed } from './furniture/bed.js';

export const furnitureTypes = {
    couch: { name: "Couch", furniture: couch },
    table: { name: "Table", furniture: table },
    chair: { name: "Chair", furniture: chair },
    bed: { name: "Bed", furniture: bed }
};
