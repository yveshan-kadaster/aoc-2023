console.log('AOC 1');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.log(data.split('\n').filter((line) => !!line).map(mapLine).reduce((p, c) => p + c, 0));
    }
};

function mapLine(line) {
    const matchedLine = line.match(/\d/g);
    return +(matchedLine[0] + matchedLine[matchedLine.length - 1]);
}

fs.readFile('142.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
