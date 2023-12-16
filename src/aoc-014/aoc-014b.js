const id = 'AOC 14;'
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time(id);
        const numCycles = 1000000000;
        let rocks = data.split('\n').filter((line) => !!line).flatMap(scanRocks);
        const sizeX = Math.max(...rocks.map(r => r.x)) + 1;
        const sizeY = Math.max(...rocks.map(r => r.y)) + 1
        for (let step = 1; step <= numCycles; step++) {
            const { rocks: movedRocks, step: cachedStep } = cycleRocks(rocks, sizeX, sizeY, step);
            rocks = movedRocks;
            if (step !== cachedStep) {
                const targetStep = (numCycles - step) % (step - cachedStep) + cachedStep;
                rocks = Object.values(slideEast.cache).find(c => c.step === targetStep ).rocks;
                break;
            }
        }
        console.log(rocks.map(loadNorth(sizeY)).reduce((p, c) => p + c, 0));
        console.timeEnd(id);
    }
};

function scanRocks(line, i) {
    return [...line.matchAll(/([O#])/g)].map((r) => ({ rock: r[0], x: r.index, y: i }));
}

function areaOfRocksKey(rocks) {
    return rocks.map(r => `${r.rock}${r.x}/${r.y}`).join('');
}

const slideNorth = {
    rowOfRocks: (rocks, n) => rocks.filter(r => r.x === n).sort((a, b) => a.y - b.y),
    moveRock: (p, c) => ({ rock: c.rock, x: c.x, y: p.y }),
    moveCube: (c) => c.y + 1,
    moveRounded: (p) => p.y + 1,
    axis: 'y',
    cache: {},
}
const slideWest = {
    rowOfRocks: (rocks, n) => rocks.filter(r => r.y === n).sort((a, b) => a.x - b.x),
    moveRock: (p, c) => ({ rock: c.rock, x: p.x, y: c.y }),
    moveCube: (c) => c.x + 1,
    moveRounded: (p) => p.x + 1,
    axis: 'x',
    cache: {},
}
const slideSouth = {
    rowOfRocks: (rocks, n) => rocks.filter(r => r.x === n).sort((a, b) => b.y - a.y),
    moveRock: (p, c) => ({ rock: c.rock, x: c.x, y: p.y }),
    moveCube: (c) => c.y - 1,
    moveRounded: (p) => p.y - 1,
    axis: 'y',
    cache: {},
}
const slideEast = {
    rowOfRocks: (rocks, n) => rocks.filter(r => r.y === n).sort((a, b) => b.x - a.x),
    moveRock: (p, c) => ({ rock: c.rock, x: p.x, y: c.y }),
    moveCube: (c) => c.x - 1,
    moveRounded: (p) => p.x - 1,
    axis: 'x',
    cache: {},
}

function slideRocks(config, rocks, size, length, step) {
    const areaKey = areaOfRocksKey(rocks);
    const cache = config.cache[areaKey];
    if (cache) {
        return { rocks: cache.rocks, step: cache.step };
    }
    const movedRocks = [...Array(size).keys()].flatMap((n) => {
        const rowOfRocks = config.rowOfRocks(rocks, n);
        return rowOfRocks.reduce((p, c) => {
            return c.rock === '#' ?
                    { [config.axis]: config.moveCube(c), rocks: [...p.rocks, c] } :
                    { [config.axis]: config.moveRounded(p), rocks: [...p.rocks, config.moveRock(p, c)] };
        }, { [config.axis]: length, rocks: [] }).rocks;
    });
    config.cache[areaKey] = { step, rocks: movedRocks };
    return { step, rocks: movedRocks };
}

function cycleRocks(rocks, sizeX, sizeY, step) {
    const { rocks: rocksN } = slideRocks(slideNorth, rocks, sizeX, 0, step);
    const { rocks: rocksW } = slideRocks(slideWest, rocksN, sizeY, 0, step);
    const { rocks: rocksS } = slideRocks(slideSouth, rocksW, sizeX, sizeY - 1, step);
    return slideRocks(slideEast, rocksS, sizeY, sizeX - 1, step);
}

function loadNorth(weight) {
    return (rock) => rock.rock === 'O' ? weight - rock.y : 0;
}

fs.readFile('64b.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
