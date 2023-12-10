console.log('AOC 5');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const mapNames = [
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
        const seedData = data.split('\n').filter((line) => !!line).reduce(reduceLine, {});
        console.log(Math.min(...processSeedData(seedData)));
    }
};

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
    return line.match(/(\d+)/g).map((v) => +v);
}

function processRange(line) {
    const match = line.match(/(\d+)/g);
    const destination = +match[0];
    const source = +match[1];
    const range = +match[2];
    return { sourceStart: source, sourceEnd: source + range - 1, offset: destination - source };
}

function processSeedData(data) {
    return data.seeds.map(mapSeed);

    function mapSeed(seed) {
        return mapNames.reduce((p, mapName) => mapWithMap(p, data[mapName]), seed);
    }

    function mapWithMap(v, map) {
        const rangeToMap = map.find((range) => range.sourceStart <= v && range.sourceEnd >= v);
        return rangeToMap ? v + rangeToMap.offset : v;
    }
}

fs.readFile('35.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
