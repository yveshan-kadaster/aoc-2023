console.log('AOC 8');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        const map = data.split('\n').filter((line) => !!line).reduce(getMapAndDirections, {})
        console.log(gotoZZZ(map));
    }
};

function getMapAndDirections(data, line, i) {
    if (i === 0) return { directions: line };
    const match = line.match(/(.*)\s+=\s+\((.*), (.*)\)/);
    return { ...data, [match[1]]: { L: match[2], R: match[3] }}
}

function gotoZZZ(data) {
    let current = 'AAA';
    let count = 0;
    let directions = data.directions;
    while (current !== 'ZZZ') {
        count = count + 1;
        current = data[current][directions[0]];
        directions = directions.substring(1);
        if (directions === '') directions = data.directions;
    }
    return count;
}

fs.readFile('6.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
