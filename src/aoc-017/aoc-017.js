const id = 'AOC 17';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const maxStraight = 3;

const UP = 'UP';
const DOWN = 'DOWN';
const LEFT = 'LEFT';
const RIGHT = 'RIGHT';

const dataObserver = {
    next: (data) => {
        console.time(id);
        const city = data.split('\n').filter((line) => !!line).reduce(createCity, { height: 0 })
        console.log(calculatePath(city) + city[city.height - 1][city[city.height - 1].width - 1].heatLoss);
        console.timeEnd(id);
    }
};

function createCity(city, cityBlockLine, y) {
    city[y] = scanHeatLoss(cityBlockLine).reduce((column, h, x) => {
        column[h.x] = { x: h.x, y, heatLoss: h.heatLoss, totalLoss: Number.MAX_SAFE_INTEGER }
        if (x + 1 > column.width) column.width = x + 1;
        return column;
    }, { width: 0 });
    if (y + 1 > city.height) city.height = y + 1;
    city[0][0].heatLoss = 0;
    return city;
}

function scanHeatLoss(cityBlockLine) {
    return cityBlockLine.split('').map(((v, x) => ({ heatLoss: +v, x })));
}

function calculatePath(city) {
    let currentStateBlocks = [{ block: city[0][0], totalLoss: 0, trail: [RIGHT], totalTrail: '' }];
    while (currentStateBlocks.length > 0) {
        const currentStateBlockIndex = currentStateBlocks.reduce((p, c, i, a) => a[p].totalLoss <= c.totalLoss ? p : i, 0);
        const currentStateBlock = currentStateBlocks[currentStateBlockIndex];
        currentStateBlocks.splice(currentStateBlockIndex, 1);
        if (isNotVisited(currentStateBlock)) {
            getNeighbourCoordinates(currentStateBlock).filter(isInsideCity(city))
                .map(n => ({
                    block: city[n.y][n.x],
                    totalLoss: Number.MAX_SAFE_INTEGER,
                    trail: currentStateBlock.trail.slice(-(maxStraight - 1)).concat([n.direction]),
                    totalTrail: currentStateBlock.totalTrail + n.direction.charAt(0)
                }))
                .filter(isNotVisited)
                .forEach(neighbourStateBlock => {
                    const pathLoss = currentStateBlock.totalLoss + currentStateBlock.block.heatLoss;
                    if (neighbourStateBlock.totalLoss > pathLoss) {
                        neighbourStateBlock.totalLoss = pathLoss;
                    }
                    if (neighbourStateBlock.block.totalLoss > pathLoss) {
                        neighbourStateBlock.block.totalLoss = pathLoss;
                        neighbourStateBlock.block.totalTrail = neighbourStateBlock.totalTrail;
                    }
                    currentStateBlocks.push(neighbourStateBlock);
                });
            currentStateBlock.block[visitedProperty(currentStateBlock)] = true;
        }
    }
    console.log(city[city.height - 1][city[city.height - 1].width - 1].totalTrail)
    return city[city.height - 1][city[city.height - 1].width - 1].totalLoss;
}

const LEFT_STRAIGHT = LEFT.repeat(maxStraight);
const RIGHT_STRAIGHT = RIGHT.repeat(maxStraight);
const UP_STRAIGHT = UP.repeat(maxStraight);
const DOWN_STRAIGHT = DOWN.repeat(maxStraight);

function getNeighbourCoordinates(b) {
    const dir = getDirection(b);
    const trail = b.trail.join('');
    return [
        ...(dir !== RIGHT && trail !== LEFT_STRAIGHT) ? [{ x: b.block.x - 1, y: b.block.y, direction: LEFT }] : [],
        ...(dir !== LEFT && trail !== RIGHT_STRAIGHT) ? [{ x: b.block.x + 1, y: b.block.y, direction: RIGHT }] : [],
        ...(dir !== DOWN && trail !== UP_STRAIGHT) ? [{ x: b.block.x, y: b.block.y - 1, direction: UP }] : [],
        ...(dir !== UP && trail !== DOWN_STRAIGHT) ? [{ x: b.block.x, y: b.block.y + 1, direction: DOWN }] : []
    ];
}

function getDirection(b) {
    return b.trail[b.trail.length - 1] || RIGHT;
}

function isInsideCity(city) {
    return c => c.x >= 0 && c.y >= 0 && c.y < city.height && c.x < city[c.y].width;
}

function isNotVisited(b) {
    return !b.block[visitedProperty(b)];
}

function visitedProperty(b) {
    let sameCount = 1;
    while(sameCount < maxStraight && b.trail.length > sameCount && b.trail[b.trail.length - sameCount] === b.trail[b.trail.length - sameCount - 1]) {
        sameCount++;
    }
    return `${b.trail.slice(-sameCount).join('+')}-visited`;
}

fs.readFile('102.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
