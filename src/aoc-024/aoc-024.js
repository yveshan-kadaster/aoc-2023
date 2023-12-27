const id = 'AOC 24';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const pmin = 200000000000000;
const pmax = 400000000000000;

const dataObserver = {
    next: (data) => {
        console.time(id);
        const hailStoneTrajectories = data.split('\n').filter((line) => !!line).map(scanHailStoneTrajectories);
        const result = hailStoneTrajectories.map(checkIntersections);
        console.log(result.reduce((p, c) => p + c, 0));
        console.timeEnd(id);
    }
};

function scanHailStoneTrajectories(hailStoneString) {
    const match = hailStoneString.match(/(\d+),\s*(\d+),\s*(\d+)\s*@\s*(-?\d+),\s*(-?\d+),\s*(-?\d+)/);
    return [+match[1], +match[2], +match[3], +match[4], +match[5], +match[6]];
}

function checkIntersections(hailStoneTrajectory, index, hailStoneTrajectories) {
    const segmentsToCheck = hailStoneTrajectories.slice(index + 1);
    if (segmentsToCheck.length === 0) return 0;
    return segmentsToCheck.reduce((count, segment) => {
        const intersection =
                intersect(hailStoneTrajectory[0], hailStoneTrajectory[1],
                        hailStoneTrajectory[0] + hailStoneTrajectory[3], hailStoneTrajectory[1] + hailStoneTrajectory[4],
                        segment[0], segment[1],
                        segment[0] + segment[3], segment[1] + segment[4]);
        if (intersection.x >= pmin && intersection.x <= pmax && intersection.y >= pmin && intersection.y <= pmax &&
                intersection.ua >= 0 && intersection.ub >= 0) return count + 1;
        return count;
    }, 0);
}

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) return false;
    d = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    if (d === 0) return false;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / d;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / d;
    const x = x1 + ua * (x2 - x1);
    const y = y1 + ua * (y2 - y1);
    return { x, y, ua, ub };
}

fs.readFile('aoc-024.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
