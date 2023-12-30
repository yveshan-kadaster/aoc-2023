const id = 'AOC 21b';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataFile = 'aoc-021.txt';
const moves = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }];
const cache = {};
const multiplier = 4;
const stepsWanted = 26501365;

//region Print
// function printGarden(garden, getTile, hideEmpty) {
//     // Per row of tiles.
//     [...Array(garden.maxY - garden.minY + 1).keys()]
//             .map(k => (+k + garden.minY).toString())
//             .forEach(gy => {
//                 // Convert row of tiles to arrays of strings per tile.
//                 const rowOfTiles = [...Array(garden.maxX - garden.minX + 1).keys()]
//                         .map(k => (+k + garden.minX).toString())
//                         .reduce((pgx, gx) => {
//                             const currentTile = garden.tiles[gy][gx] || { ...getTile(false), hideEmpty };
//                             pgx[gx] = [...Array(currentTile.height).keys()].reduce((py, y) => {
//                                 py[y] = [...Array(currentTile[y].width).keys()].reduce((px, x) => {
//                                     return px + printPlot(currentTile, y, x);
//                                 }, '');
//                                 return py;
//                             }, {});
//                             return pgx;
//                         }, {});
//                 // Concat arrays of strings of tiles per row number and print.
//                 [...Array(Object.keys(rowOfTiles[0]).length).keys()].forEach(y => {
//                     const rowKeys = Object.keys(rowOfTiles).map(v => +v).sort((a, b) => a - b);
//                     const line = rowKeys.reduce((p, n) => {
//                         return p.concat(rowOfTiles[n][y]);
//                     }, '');
//                     console.log(line);
//                 });
//             });
// }

// function printPlot(tile, y, x) {
//     // Different characters for showing not yet reached tiles.
//     if (tile.hideEmpty) return tile[y][x].c === '#' ? '?' : ' ';
//     // Plot X for even steps, O for odd steps.
//     return tile[y][x].steps !== undefined ? (tile[y][x].steps % 2 === 0 ? 'x' : 'o') : tile[y][x].c;
// }
//endregion

const dataObserver = {
    next: (data) => {
        console.time(id);
        const getTile = (isInitial) => data.split('\n').filter((line) => !!line).reduce(scanTile(isInitial), { height: 0 });
        let garden = getGarden(true, getTile);
        let stepsDone = 0;
        while (stepsDone < garden.tiles[0][0].height * multiplier) {
            stepsDone++;
            garden = doStep(garden, stepsDone, getTile, true);
            if (stepsDone % 10 === 0) console.log(`${stepsDone} of ${garden.tiles[0][0].height * multiplier}...`)
        }
        // printGarden(garden, getTile, true);
        const size = calculatePlots(garden, stepsDone, stepsWanted, getTile);
        console.log(size);
        console.timeEnd(id);
    }
};

function calculatePlots(garden, stepsDone, stepsWanted, getTile) {
    // All quadrants to treat differently.
    const quadrants = ['Qup', 'Qdown', 'Qleft', 'Qright', 'Qleft-up', 'Qright-up', 'Qleft-down', 'Qright-down']
    const tileSize = garden.tiles[0][0].height;
    // Data to keep track off per quadrant.
    const qData = quadrants.reduce((p, q) => {
        p[q] = getData(cache[q], tileSize);
        return p;
    }, {});
    // quadrants.forEach(q => console.log(`${q}: ${JSON.stringify(qData[q])}`));
    const tileFillingPerStepPerQuadrant = quadrants.reduce((p, q) => {
        console.log('Filling: ', q);
        p[q] = getTileFilling(qData[q], getTile);
        return p;
    }, {})
    // For initial tile filling starting at S.
    tileFillingPerStepPerQuadrant['Q'] = getTileFilling({ entries: [], entry: 1 }, getTile, true);
    // Object.keys(tileFillingPerStepPerQuadrant).forEach(k => {
    //     const fillingPerStep = tileFillingPerStepPerQuadrant[k].map((e, i) => `${i}: ${e}`);
    //     console.log(k, JSON.stringify(fillingPerStep), fillingPerStep.length);
    // });
    // Number of steps on filled tile for even and odd number of steps.
    const reachablePlotsPerTile = {};
    const fillLength = tileFillingPerStepPerQuadrant['Q'].length
    reachablePlotsPerTile[fillLength % 2 === 1 ? 'even' : 'odd'] = tileFillingPerStepPerQuadrant['Q'][fillLength - 1];
    reachablePlotsPerTile[fillLength % 2 === 1 ? 'odd' : 'even'] = tileFillingPerStepPerQuadrant['Q'][fillLength - 2];
    console.log(reachablePlotsPerTile);

    const plotsPerQuadrant = quadrants.reduce((p, q) => {
        const isDiagonalQuadrant = q.indexOf('-') >= 0;
        const fullTilesSize = Math.floor((stepsWanted - tileFillingPerStepPerQuadrant[q].length) / tileSize);
        const fullTilesPlotsCount = isDiagonalQuadrant
                ? Math.ceil(fullTilesSize / 2) * Math.ceil(fullTilesSize / 2) * reachablePlotsPerTile[(stepsWanted + qData[q].offset) % 2 !== 1 ? 'odd' : 'even'] +
                Math.floor(fullTilesSize / 2) * Math.floor(fullTilesSize / 2 + 1) * reachablePlotsPerTile[(stepsWanted + qData[q].offset) % 2 !== 1 ? 'even' : 'odd']
                : Math.ceil(fullTilesSize / 2) * reachablePlotsPerTile[(stepsWanted + qData[q].offset) % 2 === 1 ? 'odd' : 'even'] +
                Math.floor(fullTilesSize / 2) * reachablePlotsPerTile[(stepsWanted + qData[q].offset) % 2 === 1 ? 'even' : 'odd'];
        const totalTilesSize = Math.ceil((stepsWanted - qData[q].offset) / tileSize);
        const stepsToDoOnPartialTiles = stepsWanted - qData[q].offset - fullTilesSize * tileSize;
        const partialTilesPlotsCount = [...Array(totalTilesSize - fullTilesSize).keys()].reduce((p, n) => {
            const tileCount = isDiagonalQuadrant ? n + fullTilesSize + 1 : 1;
            const stepsToCalculateIndex = stepsToDoOnPartialTiles - n * tileSize;
            const plotsToAdd = tileFillingPerStepPerQuadrant[q][stepsToCalculateIndex - 1];
            return p + plotsToAdd * tileCount;
        }, 0);
        p[q] = fullTilesPlotsCount + partialTilesPlotsCount;
        return p;
    }, {});
    // Also count starting tile.
    return Object.keys(plotsPerQuadrant)
            .reduce((p, k) => p + plotsPerQuadrant[k], 0) + reachablePlotsPerTile[stepsWanted % 2 === 0 ? 'even' : 'odd'];
}

// isInitial sets the S starting point if true.
function scanTile(isInitial) {
    return (tile, line, y) => {
        tile[y] = line.split('').reduce((p, c, x) => {
            p[x] = { c: isInitial ? c : (c === 'S' ? '.' : c), ...(!!isInitial && c === 'S' && { steps: 0 }) };
            if (x + 1 > p.width) p.width = x + 1;
            return p;
        }, { width: 0 });
        if (y + 1 > tile.height) tile.height = y + 1;
        return tile;
    }
}

// Get an empty garden.
function getGarden(isInitial, getTile) {
    return {
        tiles: {
            min: 0,
            max: 0,
            '0': { min: 0, max: 0, '0': getTile(isInitial) }
        },
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
    }
}

// Do one step in the garden in every possible direction.
// @param stepsDone is the current step (number) to do.
function doStep(garden, stepsDone, getTile, limitHits) {
    [...Array(garden.tiles.max - garden.tiles.min + 1).keys()]
            .map(k => (+k + garden.tiles.min).toString())
            .forEach(gy => {
                [...Array(garden.tiles[gy].max - garden.tiles[gy].min + 1).keys()]
                        .map(k => (+k + garden.tiles[gy].min).toString())
                        .forEach(gx => {
                            const currentTile = garden.tiles[gy][gx];
                            [...Array(currentTile.height).keys()].forEach(y => {
                                [...Array(currentTile[y].width).keys()].forEach(x => {
                                    if (currentTile[y][x].steps === stepsDone - 1 && (!limitHits || currentTile[y][x]?.hits || 0) <= 2) {
                                        moves.map(m => ({ x: x + m.x, y: y + m.y }))
                                                .map(p => inGardenTile(gx, gy, p.x, p.y, garden, stepsDone, getTile))
                                                .filter(p => isPlot(p.x, p.y, p.tile))
                                                .forEach(p => {
                                                    p.tile[p.y][p.x].steps = stepsDone;
                                                    p.tile[p.y][p.x].hits = (p.tile[p.y][p.x].hits || 0) + 1;
                                                })
                                    }
                                });
                            });
                        });
            });
    return garden;
}

// Return valid x, y and tile based on unwrapped gx, gy, x and y.
function inGardenTile(gx, gy, x, y, garden, stepsDone, getTile) {
    let { newGx, newGy } = { newGx: +gx, newGy: +gy };
    let { newX, newY } = { newX: +x, newY: +y };
    // Check if x,y go to a new tile.
    if (y < 0) {
        newY += garden.tiles[gy][gx].height;
        newGy--
    }
    if (y >= garden.tiles[gy][gx].height) {
        newY -= garden.tiles[gy][gx].height;
        newGy++
    }
    if (x < 0) {
        newX += garden.tiles[gy][gx][newY].width;
        newGx--
    }
    if (x >= garden.tiles[gy][gx][newY].width) {
        newX -= garden.tiles[gy][gx][newY].width;
        newGx++
    }
    // Update garden size.
    if (newGy < garden.minY) garden.minY = newGy;
    if (newGy > garden.maxY) garden.maxY = newGy;
    if (newGx < garden.minX) garden.minX = newGx;
    if (newGx > garden.maxX) garden.maxX = newGx;
    // Update tiles min/max.
    if (newGy < garden.tiles.min) garden.tiles.min = newGy;
    if (newGy > garden.tiles.max) garden.tiles.max = newGy;
    if (newGx < garden.tiles[gy].min) garden.tiles[gy].min = newGx;
    if (newGx > garden.tiles[gy].max) garden.tiles[gy].max = newGx;
    // Create new tile if necessary.
    if (!garden.tiles[newGy]?.[newGx] || newGx !== +gx || newGy !== +gy) {
        addCache(gx, gy, newGx, newGy, newX, newY, garden, stepsDone);
    }
    if (!garden.tiles[newGy]) garden.tiles[newGy] = { min: newGx, max: newGx, [newGx.toString()]: getTile(false) }
    // if (!garden.tiles[newGy][newGx]) {
    //     addCache(gx, gy, newGx, newGy, newX, newY, garden, stepsDone);
    // }
    if (!garden.tiles[newGy][newGx]) garden.tiles[newGy][newGx] = getTile(false);
    // The valid x, y and tile to step on.
    return { x: newX, y: newY, tile: garden.tiles[newGy][newGx] };
}

// return true if the current position is a garden plot and not a rock.
function isPlot(x, y, tile) {
    return tile[y][x].c === '.' || tile[y][x].c === 'S';
}

function addCache(gx, gy, newGx, newGy, newX, newY, garden, stepsDone) {
    // Add cache entry when entering a new tile.
    const quadrantKey = getCacheQuadrantKey(newGx, newGy);
    if (!cache[quadrantKey]) cache[quadrantKey] = [];
    if (!!garden.tiles[newGy]?.[newGx] &&
            (garden.tiles[newGy][newGx][newY]?.[newX]?.steps ||
                    moves.some(m => !!garden.tiles[newGy][newGx][newY + m.y]?.[newX + m.x]?.steps)))
        return;
    const entry = cache[quadrantKey].find(e => e.gx === newGx && e.gy === newGy);
    if (entry) {
        // console.log('E', entry)
        entry.entries.push({ x: newX, y: newY, entry: stepsDone });
        return;
    }
    cache[quadrantKey].push({
        gx: newGx,
        gy: newGy,
        entries: [{ x: newX, y: newY, entry: stepsDone }],
        entrySteps: stepsDone,
        distance: Math.abs(newGx) + Math.abs(newGy) + (newGx === 0 || newGy === 0 ? 0 : -1),
    });
}

function getCacheQuadrantKey(gx, gy) {
    if (gx === 0 && gy < 0) return 'Qup';
    if (gx === 0 && gy > 0) return 'Qdown';
    if (gx < 0 && gy === 0) return 'Qleft';
    if (gx > 0 && gy === 0) return 'Qright';
    if (gx < 0 && gy < 0) return 'Qleft-up';
    if (gx > 0 && gy < 0) return 'Qright-up';
    if (gx < 0 && gy > 0) return 'Qleft-down';
    if (gx > 0 && gy > 0) return 'Qright-down';
    return 'Q';
}

function getData(quadrantEntries, tileSize) {
    const index = quadrantEntries.length - 1;
    const cacheEntry = quadrantEntries[index];
    const offset = Math.floor(cacheEntry.entrySteps - (cacheEntry.distance - 1) * tileSize - 1);
    const [head, ...tail] = cacheEntry.entries;
    const entries = tail.reduce((p, c) => {
        if (!p.map(e => `${e.x}+${e.y}-${e.entry}`).includes(`${c.x}+${c.y}-${c.entry}`)) p.push(c);
        return p;
    }, [head]);
    return { entries, offset, entry: cacheEntry.entrySteps, distance: cacheEntry.distance };
}

function getTileFilling(data, getTile, isInitial) {
    let garden = getGarden(!!isInitial, getTile);
    let stepsDone = !!isInitial ? 0 : 1;
    let filled = false;
    let lastFilling = 0;
    const fillingPerStep = [];
    while (!filled) {
        data.entries.forEach(e => {
            if (e.entry - data.entry === stepsDone - 1) {
                garden.tiles[0][0][e.y][e.x] = { ...garden.tiles[0][0][e.y][e.x], steps: stepsDone };
            }
        })
        const filling = calculateTile(garden.tiles[0][0], stepsDone);
        fillingPerStep.push(filling);
        filled = fillingPerStep.length > 3 &&
                (fillingPerStep[fillingPerStep.length - 1] === fillingPerStep[fillingPerStep.length - 3]) &&
                (fillingPerStep[fillingPerStep.length - 2] === fillingPerStep[fillingPerStep.length - 4]);
        lastFilling = filling;
        stepsDone++;
        garden = doStep(garden, stepsDone, getTile, false);
    }
    return fillingPerStep.slice(0, -2);
}

function calculateTile(tile, stepsDone) {
    return [...Array(tile.height).keys()].reduce((py, y) => {
        return py + [...Array(tile[y].width).keys()].reduce((px, x) => {
            return px + (tile[y][x]?.steps === stepsDone ? 1 : 0);
        }, 0);
    }, 0);
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
