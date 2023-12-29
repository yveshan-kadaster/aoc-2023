const id = 'AOC 24b';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time(id);
        const hailStoneTrajectories = data.split('\n').filter((line) => !!line).map(scanHailStoneTrajectories);
        solve(hailStoneTrajectories);
        console.timeEnd(id);
    }
};

function scanHailStoneTrajectories(hailStoneString) {
    const match = hailStoneString.match(/(\d+),\s*(\d+),\s*(\d+)\s*@\s*(-?\d+),\s*(-?\d+),\s*(-?\d+)/);
    return [+match[1], +match[2], +match[3], +match[4], +match[5], +match[6]];
}

function solve(hailStoneTrajectories) {
    // If no results in X, try Y or Z.
    const vSortedByXVelocity = [...hailStoneTrajectories].sort((a, b) => a[3] - b[3]);
    const xSpeeds = vSortedByXVelocity.reduce((p, c, i, a) => {
        if (i < a.length - 1 && c[3] === a[i+1][3]) {
            // console.log(c[3]);
            const xDiff = c[0] - a[i+1][0];
            const xFactorsUnsigned = getFactors(xDiff);
            const xFactors = xFactorsUnsigned.concat(xFactorsUnsigned.map(v => -v)).sort((a, b) => a - b);
            return p.concat([xFactors.map(v => c[3] + v)]);
        }
        return p;
    }, []);
    const xResults = xSpeeds.reduce((p, c) => {
        c.forEach((v => {
            if (!p[v]) p[v] = 0;
            p[v]++;
        }));
        return p;
    }, {});
    const xResultsSorted = Object.entries(xResults).sort((a, b) => b[1] - a[1]);

    const vx = xResultsSorted.slice(0, 4).map(v => +v[0]);
    const x = xResultsSorted.slice(0, 4).reduce((p, c) => {
        p.push(hailStoneTrajectories.filter(h => h[3] === +c[0]).map(h => h[0]));
        return p;
    }, [])

    const rockX = x[0][0];
    const rockVx = vx[0];
    const t = [];
    hailStoneTrajectories.forEach(h => {
        const tRock = (h[3] - rockVx) === 0 ? 1 : (rockX - h[0]) / (h[3] - rockVx);
        t.push(tRock);
        if (tRock !== Math.floor(tRock)) throw new Error(`t is not integer: ${h}, ${tRock}`);
    });

    const y0 = hailStoneTrajectories[0][1] + t[0] * hailStoneTrajectories[0][4];
    const z0 = hailStoneTrajectories[0][2] + t[0] * hailStoneTrajectories[0][5];
    const y1 = hailStoneTrajectories[1][1] + t[1] * hailStoneTrajectories[1][4];
    const z1 = hailStoneTrajectories[1][2] + t[1] * hailStoneTrajectories[1][5];

    const rockY = y0 -  (y1 - y0) / (t[1] - t[0]) * t[0];
    const rockZ = z0 -  (z1 - z0) / (t[1] - t[0]) * t[0];
    const rockSpeedY = (y0 - rockY) / t[0];
    const rockSpeedZ = (z0 - rockZ) / t[0];

    console.log('Result', rockX + rockY + rockZ);

    hailStoneTrajectories.forEach((h, i) => {
        if (h[0] !== rockX) {
            if (rockY + t[i] * rockSpeedY !== h[1] + t[i] * h[4]) throw new Error(`Invalid y ${i}`);
            if (rockZ + t[i] * rockSpeedZ !== h[2] + t[i] * h[5]) throw new Error(`Invalid z ${i}`);
        }
    });

    return hailStoneTrajectories;
}

function getFactors(toFactorize) {
    let n = toFactorize;
    const maxSpeed = 1000;
    const factors = [1];
    let d = 2;
    while (Math.abs(n) >= 2 && d < maxSpeed) {
        if (n % d === 0) {
            factors.push(d);
            n /= d;
        } else {
            d++;
        }
    }
    const uniqueFactors = factors.reduce((p, c) => p.includes(c) ? p : p.concat(c), []);
    return [...new Set(expandFactors(uniqueFactors).concat(uniqueFactors))].sort((a, b) => a - b);
}

function expandFactors(factors) {
    if (factors.length === 1)  return [];
    const result = factors.reduce((p, c, i, a) => {
        const newFactors = [...a];
        newFactors.splice(i, 1);
        return p.concat(expandFactors(newFactors))
    }, []);
    return result.concat([factors.reduce((p, c) => p * c, 1)]);
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
