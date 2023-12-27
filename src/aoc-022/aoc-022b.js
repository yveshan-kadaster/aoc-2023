const id = 'AOC 22b';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time(id);
        const bricks = data.split('\n').filter((line) => !!line).reduce(scanBricks, [])
                .sort((a, b) => a.b[2] - b.b[2])
                .reduce(dropBricks, []);
        const disintegrateBrickCounts = bricks.map(countDisintegratedBricks);
        console.log(disintegrateBrickCounts.reduce((p, c) => p + c, 0));
        console.timeEnd(id);
    }
};

function scanBricks(bricks, brickString, n) {
    const match = brickString.match(/(\d+),(\d+),(\d+)~(\d+),(\d+),(\d+)/);
    const a = [+match[1], +match[2], +match[3]];
    const b = [+match[4], +match[5], +match[6]];
    const brickProperties = { id: n, supports: [], supportedBy: []}
    const brick = a[2] <= b[2] ? { a, b, ...brickProperties } : { a: b, b: a, ...brickProperties };
    const d = [a[0] - b[0], a[1] - b[1], a[2] - b[2]].filter(v => v === 0).length;
    if (d < 2) throw new Error('Diagonal brick');
    bricks.push(brick);
    return bricks;
}

function dropBricks(droppedBricks, brick) {
    if (brick.a[2] !== 1) {
        const intersectingDroppedBricks = droppedBricks.filter(b => hasXYIntersection(b, brick));
        if (intersectingDroppedBricks.length > 0) {
            const topBrick = intersectingDroppedBricks[intersectingDroppedBricks.length - 1];
            const dropLength = brick.a[2] - topBrick.b[2] - 1;
            if (dropLength < 0) throw new Error('Negative dropLength');
            brick.a[2] -= dropLength;
            brick.b[2] -= dropLength;
            const supportingBricks = intersectingDroppedBricks.filter(b => b.b[2] === topBrick.b[2]);
            supportingBricks.forEach(supportingBrick => {
                brick.supportedBy.push(supportingBrick);
                supportingBrick.supports.push(brick);
            });
        } else {
            brick.a[2] = 1;
            brick.b[2] = 1;
        }
    }
    droppedBricks.push(brick);
    return droppedBricks.sort((a, b) => a.b[2] - b.b[2]);
}

function hasXYIntersection(a, b) {
    const aCubes = !!a.expanded ? a.expanded : expandBrick(a);
    if (!a.expanded) a.expanded = aCubes;
    const bCubes = !!b.expanded ? b.expanded : expandBrick(b);
    if (!b.expanded) b.expanded = bCubes;
    return aCubes.some(a => bCubes.some(b => a[0] === b[0] && a[1] === b[1]));
}

function expandBrick(brick) {
    const direction = [brick.b[0] - brick.a[0], brick.b[1] - brick.a[1]];
    const brickLength = direction[0] !== 0 ? direction[0] : direction[1];
    if (brickLength === 0) return [brick.a.slice(0, 2)];
    return [...Array(brickLength + 1).keys()].reduce((cubes, n) => {
        cubes.push([brick.a[0] + n * direction[0] / brickLength, brick.a[1] + n * direction[1] / brickLength]);
        return cubes;
    }, [])
}

function countDisintegratedBricks(b) {
    return disintegrate(b, [...b.supportedBy.map(c => c.id)]) - 1;
}

function disintegrate(b, disintegratedIds) {
    if (!disintegratedIds.includes(b.id) && b.supportedBy.every(c => disintegratedIds.includes(c.id))) {
        disintegratedIds.push(b.id);
        return b.supports.reduce((p, c) => {
            return p + disintegrate(c, disintegratedIds);
        }, 1);
    }
    return 0;
}

fs.readFile('aoc-022.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
