console.log('AOC 8b');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        const map = data.split('\n').filter((line) => !!line).reduce(getMapAndDirections, {})
        console.log(gotoZ(map));
    }
};

function getMapAndDirections(data, line, i) {
    if (i === 0) return { directions: line };
    const match = line.match(/(.*)\s+=\s+\((.*), (.*)\)/);
    return { ...data, [match[1]]: { L: match[2], R: match[3], isStarter: match[1].endsWith('A'), isFinisher: match[1].endsWith('Z') }}
}

function gotoZ(data) {
    const starters = Object.entries(data).filter((e) => e[1].isStarter).map((e) => e[0]);
    const loops = starters.map((c) => gotoZZZ(data, c));
    const lcm = (...arr) => {
        const gcd = (x, y) => (!y ? x : gcd(y, x % y));
        const _lcm = (x, y) => (x * y) / gcd(x, y);
        return [...arr].reduce((a, b) => _lcm(a, b));
    };
    return lcm(...loops);
}

function gotoZZZ(data, starter) {
    let current = starter;
    let count = 0;
    let directions = data.directions;
    while (!current.endsWith('Z')) {
        count = count + 1;
        current = data[current][directions[0]];
        directions = directions.substring(1);
        if (directions === '') directions = data.directions;
    }
    return count;
}

fs.readFile('6b.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
