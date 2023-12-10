console.log('AOC 9');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.log(data.split('\n').filter((line) => !!line)
                .map(mapLine)
                .map(predict)
                .reduce((p, c) => p + c, 0));
    }
};

function mapLine(line) {
    return line.match(/(-?\d+)/g).map((v) => +v);
}

function predict(line) {
    if (line.every((v) => v === 0)) return 0;
    const diff = predict(line.reduce((p, c, i) => {
        if (i === 0) return { prev: c, newline: [] };
        return { prev: c, newline: [...p.newline, c - p.prev] }
    }, { prev: undefined, newline: [] }).newline);
    return line[line.length - 1] + diff;
}

fs.readFile('114.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
