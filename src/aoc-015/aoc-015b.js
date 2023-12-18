const id = 'AOC 15b';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time(id);
        data.split(',').map(s => s.replace('\n', '')).forEach(applyOperation);
        console.log(calculateTotalFocusingPower(boxes));
        console.timeEnd(id);
    }
};

const boxes = {};

function applyOperation(s) {
    const match = s.match(/([a-z]+)(-|=(\d))/);
    const label = match[1];
    const boxNumber = getHash(label);
    if (match[2] === '-') {
        remove(boxNumber, label)
    } else {
        const focalLength = +match[3];
        place(boxNumber, label, focalLength);
    }
}

function getHash(s) {
    return s.split('').reduce((p, c) => ((p + c.charCodeAt(0)) * 17) % 256, 0);
}

function remove(boxNumber, label) {
    const boxContents = boxes[boxNumber] || [];
    const lensPosition = boxContents.findIndex(l => l.label === label);
    if (lensPosition >= 0) {
        boxContents.splice(lensPosition, 1);
    }
    boxes[boxNumber] = boxContents;
}

function place(boxNumber, label, focalLength) {
    const boxContents = boxes[boxNumber] || [];
    const lensPosition = boxContents.findIndex(l => l.label === label);
    if (lensPosition < 0) {
        boxContents.push({ label, focalLength });
    } else {
        boxContents[lensPosition].focalLength = focalLength;
    }
    boxes[boxNumber] = boxContents;
}

function calculateTotalFocusingPower(boxes) {
    return Object.keys(boxes).reduce((totalFocusingPower, boxNumber) => {
        return totalFocusingPower + boxes[boxNumber].reduce((boxFocusingPower, lens, lensPosition) => {
            return boxFocusingPower + (+boxNumber + 1) * (lensPosition + 1) * lens.focalLength;
        }, 0);
    }, 0);
}

fs.readFile('145b.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
