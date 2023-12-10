console.log('AOC 10');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const GO_U = 'up';
const GO_D = 'down';
const GO_L = 'left';
const GO_R = 'right';
const STUCK = 'stuck';
const START = 'start';
const mapSymbolProperties = {
    '|': { top: true, left: false, bottom: true, right: false, isStart: false, [GO_U]: GO_U, [GO_D]: GO_D, [GO_L]: STUCK, [GO_R]: STUCK },
    '-': { top: false, left: true, bottom: false, right: true, isStart: false, [GO_U]: STUCK, [GO_D]: STUCK, [GO_L]: GO_L, [GO_R]: GO_R },
    'L': { top: true, left: false, bottom: false, right: true, isStart: false, [GO_U]: STUCK, [GO_D]: GO_R, [GO_L]: GO_U, [GO_R]: STUCK },
    'J': { top: true, left: true, bottom: false, right: false, isStart: false, [GO_U]: STUCK, [GO_D]: GO_L, [GO_L]: STUCK, [GO_R]: GO_U },
    '7': { top: false, left: true, bottom: true, right: false, isStart: false, [GO_U]: GO_L, [GO_D]: STUCK, [GO_L]: STUCK, [GO_R]: GO_D },
    'F': { top: false, left: false, bottom: true, right: true, isStart: false, [GO_U]: GO_R, [GO_D]: STUCK, [GO_L]: GO_D, [GO_R]: STUCK },
    '.': { top: false, left: false, bottom: false, right: false, isStart: false, [GO_U]: STUCK, [GO_D]: STUCK, [GO_L]: STUCK, [GO_R]: STUCK },
    'S': { top: true, left: true, bottom: true, right: true, isStart: true, [GO_U]: START, [GO_D]: START, [GO_L]: START, [GO_R]: START },
}
const tryDirections = [GO_U, GO_R, GO_D, GO_L];


const dataObserver = {
    next: (data) => {
        const map = createCells(data.split('\n').filter((line) => !!line).reduce(scanMap, { map: [], start: {} }));
        console.log(getMaxDistanceFromStart(calculateDistanceFromStart(map), map));
    }
};

function scanMap(p, c, i) {
    const startPosition = c.indexOf('S');
    return { map: [...p.map, c], start: startPosition >= 0 ? { x: startPosition, y: i } : p.start };
}

function createCells(map) {
    map.cells = map.map.map((row) => row.split('').map((c) => ({ symbol: c, properties: mapSymbolProperties[c], steps: Number.MAX_SAFE_INTEGER })));
    return map;
}

function calculateDistanceFromStart(map) {
    return tryDirections.map((dir) => doLoop(map, dir, map.start.x, map.start.y));

    function doLoop(map, dir, x, y) {
        let steps = 0;
        while (true) {
            switch (dir) {
                case GO_U:
                case GO_D:
                case GO_L:
                case GO_R:
                    if (steps < map.cells[y][x].steps) map.cells[y][x].steps = steps;
                    ({ x, y, dir } = step(map, x, y, dir));
                    break;
                case START:
                    return START;
                default:
                    return STUCK;
            }
            steps = steps + 1;
        }
    }
}

function step(map, x, y, dir) {
    switch (dir) {
        case GO_U:
            if (map.cells[y][x].properties.top && y > 0 && map.cells[y-1][x].properties.bottom)
                return { x, y: y-1, dir: map.cells[y-1][x].properties[dir] }
            return { dir: STUCK, x, y }
        case GO_D:
            if (map.cells[y][x].properties.bottom && y < map.cells.length - 1 && map.cells[y+1][x].properties.top)
                return { x, y: y+1, dir: map.cells[y+1][x].properties[dir] }
            return { dir: STUCK, x, y }
        case GO_L:
            if (map.cells[y][x].properties.left && x > 0 && map.cells[y][x-1].properties.right)
                return { x: x-1, y, dir: map.cells[y][x-1].properties[dir] }
            return { dir: STUCK, x, y }
        case GO_R:
            if (map.cells[y][x].properties.right && x < map.cells[y].length - 1 && map.cells[y][x+1].properties.left)
                return { x: x+1, y, dir: map.cells[y][x+1].properties[dir] }
            return { dir: STUCK, x, y }
        default:
            return { dir: STUCK, x, y };
    }
}

function getMaxDistanceFromStart(dirResults, map) {
    const i = dirResults.indexOf(START);
    return tryDirections.map((dir) => doLoop(map, dir, map.start.x, map.start.y))[i];

    function doLoop(map, dir, x, y) {
        let steps = 0;
        while (true) {
            switch (dir) {
                case GO_U:
                case GO_D:
                case GO_L:
                case GO_R:
                    if (steps < map.cells[y][x].steps) steps = map.cells[y][x].steps;
                    ({ x, y, dir } = step(map, x, y, dir));
                    break;
                case START:
                    return steps;
                default:
                    return 0;
            }
        }
    }
}

fs.readFile('8.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
