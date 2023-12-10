console.log('AOC 4');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const powsOfTwo = [0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];

const dataObserver = {
    next: (data) => {
        console.log(data.split('\n').filter((line) => !!line).map(mapLine).reduce((p, c) => p + c, 0));
    }
};

function mapLine(line) {
    const match = line.match(/Card\s+\d+:(.*)\|(.*)/);
    const winningNumbers = match[1].match(/(\d+)/g);
    const numbers = match[2].match(/(\d+)/g);
    const matchingNumbers = numbers.filter((number) => winningNumbers.includes(number));
    return powsOfTwo[matchingNumbers.length];
}

fs.readFile('13.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
