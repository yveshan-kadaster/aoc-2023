console.log('AOC 4b');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        const cardData = data.split('\n').filter((line) => !!line).reduce(reduceLine, {});
        console.log(Object.values(cardData).reduce((p, c) => p + c, 0));
    }
};

function reduceLine(previous, current, index) {
    previous[index] = (previous[index] || 0) + 1;
    const currentCardCount = previous[index];
    const winCopyRange = [...Array(getMatchingNumbers(current).length).keys()].map((n) => index + n + 1);
    winCopyRange.forEach((i) => (previous[i] = (previous[i] || 0) + currentCardCount));
    return previous;
}

function getMatchingNumbers(line) {
    const match = line.match(/Card\s+\d+:(.*)\|(.*)/);
    const winningNumbers = match[1].match(/(\d+)/g);
    const numbers = match[2].match(/(\d+)/g);
    return numbers.filter((number) => winningNumbers.includes(number));
}

fs.readFile('30b.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
