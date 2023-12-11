console.log('AOC 11');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        const map = expandMap(data.split('\n').filter((line) => !!line).reduce(scanMap, { galaxies: [], width: 0, height: 0 }));
        console.log(getDistances(map).reduce((p, c) => p + c, 0))
    }
};

function scanMap(result, line, i) {
    return {
        width: line.length > result.width ? line.length : result.width,
        height: i + 1 > result.height ? i + 1 : result.height,
        galaxies: [...line.matchAll(/#/g)].reduce((p, c) => [...p, { x: c.index, y: i }], result.galaxies),
    };
}

function expandMap(map) {
    const expansionX = findExpansion(map.width, map.galaxies.map((p) => p.x))
    const expansionY =findExpansion(map.height, map.galaxies.map((p) => p.y));
    return {
        width: map.width + expansionX[expansionX.length - 1],
        height: map.height + expansionY[expansionY.length - 1],
        galaxies: map.galaxies.map((p) => ({ x: p.x + expansionX[p.x], y: p.y + expansionY[p.y] })),
    };
}

function findExpansion(size, included) {
    const allPositions = [...Array(size).keys()];
    const occupiedPositions = new Set(included);
    const empty = [...allPositions.filter((v) => !occupiedPositions.has(v)), size];
    return empty.reduce((p, c, i) => {
        return Array(c).fill(i).map((v, i) => i < p.length ? p[i] : v);
    }, []);
}

function getDistances(map) {
    return map.galaxies.flatMap((g, i) => getGalaxyDistances(g, map.galaxies.slice(i + 1)));
}

function getGalaxyDistances(galaxy, otherGalaxies) {
    return !otherGalaxies || otherGalaxies.length === 0 ? [] : otherGalaxies.map((g) => getGalaxyGalaxyDistance(galaxy, g));
}

function getGalaxyGalaxyDistance(galaxy1, galaxy2) {
    return Math.abs(galaxy1.x - galaxy2.x) + Math.abs(galaxy1.y - galaxy2.y);
}

fs.readFile('374.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
