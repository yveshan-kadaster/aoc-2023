console.log('AOC 12');

const fs = require('node:fs');
const { Subject } = require("rxjs");

let tries = 0;

const dataObserver = {
    next: (data) => {
        const rows = data.split('\n').filter((line) => !!line).map(scanRow)
        console.log(rows.flatMap(findMatches).length, `(${tries})`);
    }
};

function scanRow(line) {
    const record = line.split(/\s+/);
    return {
        condition: record[0],
        checksum: record[1].match(/(\d+)/g).map(v => +v),
        unknownCount: record[0].length - record[0].replaceAll('?', '').length
    }
}

function findMatches(row) {
    const toReplacement = (n) => numberToConditionReplacement(n, row.unknownCount);
    const applyReplacement = (r) => applyReplacementToCondition(row.condition, r);
    return [...Array(1 << row.unknownCount).keys()]
            .map(toReplacement).map(applyReplacement)
            .filter(r => {
                tries++;
                const c = getChecksum(r);
                return row.checksum.length === c.length && row.checksum.every((v, i) => v === c[i]);
            });
}

function getChecksum(row) {
    return row.match(/([.#])\1*/g).filter(s => s.startsWith('#')).map(s => s.length);
}

function numberToConditionReplacement(n, len) {
    return (n >>> 0).toString(2).padStart(len, '.');
}

function applyReplacementToCondition(condition, replacement) {
    return replacement.split('').reduce((p, c) => p.replace('?', c === '1' ? '#' : '.'), condition);
}

fs.readFile('21.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
