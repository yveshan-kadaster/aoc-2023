console.log('AOC 3');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        const lines = data.split('\n').filter((line) => !!line);
        const partNumbers = getPartNumbers(lines.flatMap(mapToNumbers), lines.flatMap(mapToSymbols));
        console.log(partNumbers.reduce((p, c) => p + c, 0));
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

function mapToSymbols(line, lineNumber) {
    return [...(line.matchAll(/[^.0123456789]/g))].map((match) => ({
        line: lineNumber,
        position: match.index
    }));
}

function getPartNumbers(numbers, symbols) {
    return numbers.filter((number) => isNextToAnySymbol(number, symbols)).map((number) => number.value);
}

function isNextToAnySymbol(number, symbols) {
    return symbols.some((symbol) => isNextToSymbol(number, symbol));
}

function isNextToSymbol(number, symbol) {
    const lineDiff = number.line - symbol.line;
    return !(lineDiff < -1 || lineDiff > 1 ||
            symbol.position < number.start - 1 ||
            symbol.position > number.end + 1);
}

fs.readFile('4361.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
