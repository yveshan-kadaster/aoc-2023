console.log('AOC 6b');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        const parsedData = data.split('\n').filter((line) => !!line).reduce(reduceLine, {});
        const result = process([parsedData]);
        console.log(result.reduce((p, c) => p * c, 1));
    }
};

function reduceLine(total, line,) {
    const label = line.match(/(.*):/)[0];
    const matchedLine = line.match(/(\d)/g).join('');
    return { ...total, [label]: +matchedLine };
}

function process(data) {
    return data.map(getRaceWinCount);
}

function getRaceWinCount(raceData) {
    const time = raceData['Time:'];
    const distanceToBeat = raceData['Distance:'];
    const b2minus4ac = Math.sqrt(time * time - 4 * distanceToBeat);
    const x1 = (-1 * time + b2minus4ac) / -2;
    const x2 = (-1 * time - b2minus4ac) / -2;
    const min = Math.floor(Math.min(x1, x2) + 1);
    const max = Math.ceil(Math.max(x1, x2) - 1);
    return max - min + 1;
}

fs.readFile('71503b.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
