const id = 'AOC 14';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time(id);
        const rocks = data.split('\n').filter((line) => !!line).flatMap(scanRocks);
        const sizeX = Math.max(...rocks.map(r => r.x)) + 1;
        const sizeY = Math.max(...rocks.map(r => r.y)) + 1
        console.log(slideRocksNorth(rocks, sizeX).map(loadNorth(sizeY)).reduce((p, c) => p + c, 0));
        console.timeEnd(id);
    }
};

function scanRocks(line, i) {
    return [...line.matchAll(/([O#])/g)].map((r) => ({ rock: r[0], x: r.index, y: i }));
}

function slideRocksNorth(rocks, sizeX) {
    return [...Array(sizeX).keys()].flatMap((x) => {
        return rocks.filter(r => r.x === x).sort((a, b) => a.y - b.y).reduce((p, c) => {
            return c.rock === '#' ?
                    { y: c.y + 1, rocks: [...p.rocks, c] } :
                    { y: p.y + 1, rocks: [...p.rocks, { rock: c.rock, x: c.x, y: p.y }] };
        }, { y: 0, rocks: [] }).rocks;
    });
}

function loadNorth(weight) {
    return (rock) => rock.rock === 'O' ? weight - rock.y : 0;
}

fs.readFile('136.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
