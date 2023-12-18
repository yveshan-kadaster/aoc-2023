const id = 'AOC 16';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time(id);
        const contraption = data.split('\n').filter((line) => !!line).reduce(createContraption, { height: 0 })
        console.log(energize(contraption, [{ x: 0, y: 0, heading: RIGHT }]));
        console.timeEnd(id);
    }
};

function createContraption(row, line, y) {
    row[y] = scanMirrors(line).reduce((column, m, x) => {
        column[m.x] = { item: m.item };
        if (x + 1 > column.width) column.width = x + 1;
        return column;
    }, { width: 0 });
    if (y + 1 > row.height) row.height = y + 1;
    return row;
}

function scanMirrors(line) {
    return [...line.matchAll(/([\\/\-|.])/g)].map((r) => ({ item: r[0], x: r.index }));
}

const UP = 'up';
const DOWN = 'down';
const LEFT = 'left';
const RIGHT = 'right';

const rules = {
    '.': { [UP]: [UP], [DOWN]: [DOWN], [LEFT]: [LEFT], [RIGHT]: [RIGHT] },
    '|': { [UP]: [UP], [DOWN]: [DOWN], [LEFT]: [UP, DOWN], [RIGHT]: [UP, DOWN] },
    '-': { [UP]: [LEFT, RIGHT], [DOWN]: [LEFT, RIGHT], [LEFT]: [LEFT], [RIGHT]: [RIGHT] },
    '/': { [UP]: [RIGHT], [DOWN]: [LEFT], [LEFT]: [DOWN], [RIGHT]: [UP] },
    '\\': { [UP]: [LEFT], [DOWN]: [RIGHT], [LEFT]: [UP], [RIGHT]: [DOWN] }
}

function energize(contraption, beamQueue) {
    let numEnergizedTiles = 0;
    while (beamQueue.length > 0) {
        const beam = beamQueue.shift();
        if (!contraption[beam.y][beam.x][beam.heading]) {
            contraption[beam.y][beam.x][beam.heading] = 'X';
            if (!contraption[beam.y][beam.x].energized) {
                numEnergizedTiles++;
                contraption[beam.y][beam.x].energized = 'X';
            }
            rules[contraption[beam.y][beam.x].item][beam.heading].forEach((direction) => {
                switch (direction) {
                    case UP:
                        if (beam.y - 1 >= 0) beamQueue.push({ x: beam.x, y: beam.y - 1, heading: direction });
                        break;
                    case DOWN:
                        if (beam.y + 1 < contraption.height) beamQueue.push({ x: beam.x, y: beam.y + 1, heading: direction });
                        break;
                    case LEFT:
                        if (beam.x - 1 >= 0) beamQueue.push({ x: beam.x - 1, y: beam.y, heading: direction });
                        break;
                    case RIGHT:
                        if (beam.x + 1 < contraption[beam.y].width) beamQueue.push({ x: beam.x + 1, y: beam.y, heading: direction });
                        break;
                    default:
                        throw new Error('Should not happen');
                }
            });
        }
    }
    return numEnergizedTiles;
}

fs.readFile('aoc-016.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
