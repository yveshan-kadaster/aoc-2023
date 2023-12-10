console.log('AOC 3b');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        const lines = data.split('\n').filter((line) => !!line);
        const gearRatios = getGearRatios(lines.flatMap(mapToNumbers), lines.flatMap(mapToGearSymbols));
        console.log(gearRatios.reduce((p, c) => p + c, 0));
    }
};

function mapToNumbers(line, lineNumber) {
    return [...(line.matchAll(/(\d+)/g))].map((match) => ({
        value: +match[0],
        line: lineNumber,
        start: match.index,
        end: match.index + match[0].length - 1
    }));
}

function mapToGearSymbols(line, lineNumber) {
    const matches = line.matchAll(/\*/g);
    return [...matches].map((match) => ({
        line: lineNumber,
        position: match.index
    }));
}

function getGearRatios(numbers, gears) {
    return gears.map((gear) => adjacentNumbers(gear, numbers))
            .filter((numbers) => numbers.length === 2)
            .map((numbers) => numbers[0].value * numbers[1].value);
}

function adjacentNumbers(gear, numbers) {
    return numbers.filter((number) => isNextToGear(number, gear));
}

function isNextToGear(number, gear) {
    const lineDiff = number.line - gear.line;
    return !(lineDiff < -1 || lineDiff > 1 ||
            gear.position < number.start - 1 ||
            gear.position > number.end + 1);
}

fs.readFile('467835b.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
