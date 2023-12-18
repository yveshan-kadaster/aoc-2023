const id = 'AOC 15';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time(id);
        const initializationSequences = data.split(',').map(s => s.replace('\n', ''));
        console.log(initializationSequences.map(getHash).reduce((p, c) => p + c, 0));
        console.timeEnd(id);
    }
};

function getHash(s) {
    return s.split('').reduce((p, c) => ((p + c.charCodeAt(0)) * 17) % 256, 0);
}

fs.readFile('1320.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
