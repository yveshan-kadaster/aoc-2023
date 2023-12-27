const id = 'AOC 21';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataFile = 'aoc-021.txt';
const moves = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }];
const steps = dataFile === '16-6.txt' ? 6 : 64;

const dataObserver = {
    next: (data) => {
        console.time(id);
        const garden = data.split('\n').filter((line) => !!line).reduce(scanGarden, { height: 0 });
        const result = doSteps(garden, steps);
        console.log([...Array(result.height).keys()].reduce((p, y) => {
            return p + [...Array(result[y].width).keys()].reduce((p, x) => {
                return p + (result[y][x]['0'] ? 1 : 0);
            }, 0);
        }, 0));
        console.timeEnd(id);
    }
};

function scanGarden(garden, line, y) {
    garden[y] = line.split('').reduce((p, c, x) => {
        p[x] = { c, ...(c === 'S' && { [steps]: true }) };
        if (x + 1 > p.width) p.width = x + 1;
        return p;
    }, { width: 0 });
    if (y + 1 > garden.height) garden.height = y + 1;
    return garden;
}

function doSteps(garden, stepsToDo) {
    if (stepsToDo <= 0) return garden;
    const newStepsToDo = stepsToDo - 1;
    [...Array(garden.height).keys()].forEach(y => {
        [...Array(garden[y].width).keys()].forEach(x => {
            if (garden[y][x][stepsToDo]) {
                moves.map(m => ({ x: x + m.x, y: y + m.y }))
                        .filter(p => isInGarden(p.x, p.y, garden))
                        .filter(p => isPlot(p.x, p.y, garden))
                        .forEach(p => garden[p.y][p.x][newStepsToDo] = true)
            }
        });
    });
    return doSteps(garden, newStepsToDo);
}

function isInGarden(x, y, garden) {
    return y >= 0 && y < garden.height && x >= 0 && x < garden[y].width;
}

function isPlot(x, y, garden) {
    return garden[y][x].c === '.' || garden[y][x].c === 'S';
}

fs.readFile(dataFile, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
