console.log('AOC 5b');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const mapNames = [
    'identity-mapping:',
    'seed-to-soil map:',
    'soil-to-fertilizer map:',
    'fertilizer-to-water map:',
    'water-to-light map:',
    'light-to-temperature map:',
    'temperature-to-humidity map:',
    'humidity-to-location map:',
];

const dataObserver = {
    next: (data) => {
        console.time('AOC 5b');
        const seedData = data.split('\n').filter((line) => !!line).reduce(reduceLine, {
            'identity-mapping:': [{
                mapStart: 0,
                sourceStart: 0,
                mapEnd: Number.MAX_SAFE_INTEGER,
                sourceEnd: Number.MAX_SAFE_INTEGER,
                offset: 0,
                mapOffset: 0,
            }]
        });
        console.log(Math.min(...processSeedData(seedData)));
        console.timeEnd('AOC 5b');
    }
};

//region Parser
function reduceLine(previous, current) {
    if (current.startsWith('seeds:')) {
        previous.seeds = processSeeds(current);
    } else if (mapNames.includes(current)) {
        previous.currentMap = current;
    } else {
        if (!previous[previous.currentMap]) previous[previous.currentMap] = [];
        previous[previous.currentMap].push(processRange(current));
    }
    return previous;
}

function processSeeds(line) {
    return line.match(/(\d+)\s*(\d+)/g)
            .map((v) => v.match(/(\d+)/g))
            .map((p) => ({ start: +p[0], end: (+p[0] + +p[1] - 1) }));
}

function processRange(line) {
    const match = line.match(/(\d+)/g);
    const destination = +match[0];
    const source = +match[1];
    const range = +match[2];
    return { sourceStart: source, sourceEnd: source + range - 1, offset: destination - source };
}

//endregion

//region Merge Mappings
function mergeMaps(data) {
    return mapNames.reduce((mappings, mapName) => mergeMap(mappings, data[mapName]), []);
}

function mergeMap(mappings, map) {
    mappings = map
            .reduce((mappings, mapping) => {
                if (!mappings.length) return [mapping];
                return mergeMappings(mappings, mapping);
            }, mappings)
            .map((mapping) => ({
                sourceStart: mapping.sourceStart,
                sourceEnd: mapping.sourceEnd,
                mapStart: mapping.mapStart + mapping.mapOffset,
                mapEnd: mapping.mapEnd + mapping.mapOffset,
                offset: mapping.offset + mapping.mapOffset,
                mapOffset: 0,
            }));
    return mappings;
}

function mergeMappings(mappings, mapping) {
    const unmodifiedMappings = mappings.filter((m) => !(m.mapStart <= mapping.sourceEnd && mapping.sourceStart <= m.mapEnd));
    const mappingsToMerge = mappings.filter((m) => m.mapStart <= mapping.sourceEnd && mapping.sourceStart <= m.mapEnd);
    const modifiedMappings = mappingsToMerge.reduce((p, mappingToMerge) => {
        return [...p, ...mergeMapping(mappingToMerge, mapping)];
    }, []);
    return [...unmodifiedMappings, ...modifiedMappings];
}

function mergeMapping(mappingToMerge, mapping) {
    const mergedMappings = [];
    if (mappingToMerge.mapStart < mapping.sourceStart) {
        mergedMappings.push({
                    mapStart: mappingToMerge.mapStart,
                    mapEnd: mapping.sourceStart - 1,
                    sourceStart: mappingToMerge.sourceStart,
                    sourceEnd: mappingToMerge.sourceStart + (mapping.sourceStart - mappingToMerge.mapStart) - 1,
                    offset: mappingToMerge.offset,
                    mapOffset: mappingToMerge.mapOffset
                }
        );
    }
    mergedMappings.push({
                mapStart: Math.max(mappingToMerge.mapStart, mapping.sourceStart),
                mapEnd: Math.min(mappingToMerge.mapEnd, mapping.sourceEnd),
                sourceStart: mappingToMerge.sourceStart + Math.max(mappingToMerge.mapStart, mapping.sourceStart) - mappingToMerge.mapStart,
                sourceEnd: mappingToMerge.sourceEnd + Math.min(mappingToMerge.mapEnd, mapping.sourceEnd) - mappingToMerge.mapEnd,
                offset: mappingToMerge.offset,
                mapOffset: mappingToMerge.mapOffset + mapping.offset
            }
    );
    if (mappingToMerge.mapEnd > mapping.sourceEnd) {
        mergedMappings.push({
                    mapStart: mapping.sourceEnd + 1,
                    mapEnd: mappingToMerge.mapEnd,
                    sourceStart: mappingToMerge.sourceEnd - (mappingToMerge.mapEnd - mapping.sourceEnd) + 1,
                    sourceEnd: mappingToMerge.sourceEnd,
                    offset: mappingToMerge.offset,
                    mapOffset: mappingToMerge.mapOffset
                }
        );
    }
    return mergedMappings;
}

//endregion

//region Processor
function processSeedData(data) {
    const seedMap = mergeMaps(data);
    const filteredSeedMap = seedMap.filter((m) => data.seeds.some((s) => m.sourceStart <= s.end && s.start <= m.sourceEnd));
    return filteredSeedMap.map((m) => m.sourceStart + m.offset);
}

//endregion

fs.readFile('46b.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
