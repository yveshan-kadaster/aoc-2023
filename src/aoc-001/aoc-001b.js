console.log('AOC 1b');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        const lines = data.split('\n').filter((line) => !!line);
        const mappedLines = lines.map(mapLine);
        console.log(mappedLines.reduce((p, c) => p + c, 0));
    }
};

function mapLine(line) {
    const regexp = /(?=(\d|one|two|three|four|five|six|seven|eight|nine))/g;
    const matchedLine = Array.from(line.matchAll(regexp), x => x[1]).map(mapDigit);
    return +(matchedLine[0] + matchedLine[matchedLine.length - 1]);
}

function mapDigit(digit) {
    switch(digit) {
        case 'one': return '1';
        case 'two': return '2';
        case 'three': return '3';
        case 'four': return '4';
        case 'five': return '5';
        case 'six': return '6';
        case 'seven': return '7';
        case 'eight': return '8';
        case 'nine': return '9';
        default: return digit;
    }
}

fs.readFile('281b.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
