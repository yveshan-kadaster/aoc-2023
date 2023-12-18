const id = 'AOC 17b';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const minStraight = 4;
const maxStraight = 10;

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
    let tries = 0;
    let currentStateBlocks = [{ block: city[0][0], totalLoss: 0, trail: [RIGHT], totalTrail: '' }];
    while (currentStateBlocks.length > 0) {
        const currentStateBlockIndex = currentStateBlocks.reduce((p, c, i, a) => a[p].totalLoss <= c.totalLoss ? p : i, 0);
        const currentStateBlock = currentStateBlocks[currentStateBlockIndex];
        currentStateBlocks.splice(currentStateBlockIndex, 1);
        // console.log(currentStateBlock.totalLoss);
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
                        tries++;
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
    console.log(tries);
    console.log(city[city.height - 1][city[city.height - 1].width - 1].totalTrail)
    return city[city.height - 1][city[city.height - 1].width - 1].totalLoss;
}

const LEFT_MAX_STRAIGHT = LEFT.repeat(maxStraight);
const RIGHT_MAX_STRAIGHT = RIGHT.repeat(maxStraight);
const UP_MAX_STRAIGHT = UP.repeat(maxStraight);
const DOWN_MAX_STRAIGHT = DOWN.repeat(maxStraight);

function getNeighbourCoordinates(b) {
    const dir = getDirection(b);
    const sameCount = straightCount(b);
    const trail = b.trail.join('');
    if (sameCount < 4) {
        switch(dir) {
            case LEFT: return [{ x: b.block.x - 1, y: b.block.y, direction: LEFT }];
            case RIGHT: return [{ x: b.block.x + 1, y: b.block.y, direction: RIGHT }];
            case UP: return [{ x: b.block.x, y: b.block.y - 1, direction: UP }];
            case DOWN: return [{ x: b.block.x, y: b.block.y + 1, direction: DOWN }];
        }
    }
    return [
        ...(dir !== RIGHT && trail !== LEFT_MAX_STRAIGHT) ? [{ x: b.block.x - 1, y: b.block.y, direction: LEFT }] : [],
        ...(dir !== LEFT && trail !== RIGHT_MAX_STRAIGHT) ? [{ x: b.block.x + 1, y: b.block.y, direction: RIGHT }] : [],
        ...(dir !== DOWN && trail !== UP_MAX_STRAIGHT) ? [{ x: b.block.x, y: b.block.y - 1, direction: UP }] : [],
        ...(dir !== UP && trail !== DOWN_MAX_STRAIGHT) ? [{ x: b.block.x, y: b.block.y + 1, direction: DOWN }] : []
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
    const sameCount = straightCount(b);
    return `${b.trail.slice(-sameCount).join('+')}-visited`;
}

function straightCount(b) {
    let sameCount = 1;
    while(sameCount < maxStraight && b.trail.length > sameCount && b.trail[b.trail.length - sameCount] === b.trail[b.trail.length - sameCount - 1]) {
        sameCount++;
    }
    return sameCount;
}

fs.readFile('aoc-017.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
