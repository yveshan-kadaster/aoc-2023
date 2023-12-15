console.log('AOC 12b');

// 28606137449920

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time('AOC 12b');
        const rows = data.split('\n').filter((line) => !!line).map(scanRow5)
        const results = rows.map(findMatches);
        console.log(results.reduce((p, c) => p + c, 0));
        console.timeEnd('AOC 12b');
    }
};

function scanRow5(line) {
    const record = line.split(/\s+/);
    const condition  = [record[0], record[0], record[0], record[0], record[0] ].join('?');
    const checksum = record[1].match(/(\d+)/g).map(v => +v);
    return {
        condition: condition,
        checksum: [...checksum, ...checksum, ...checksum, ...checksum, ...checksum ],
    }
}

function findMatches(row) {
    const dotsMatchStart = row.condition.match(/(^\.+)/);
    const dotsMatchEnd = row.condition.match(/(\.+)$/);
    const dotsAtStart = dotsMatchStart ? dotsMatchStart[0].length : 0;
    const dotsAtEnd = dotsMatchEnd ? dotsMatchEnd[0].length : 0;
    const dots = [dotsAtStart, ...Array(row.checksum.length - 1).fill(1), dotsAtEnd];
    return generatePartialMatches(row, '', row.condition, row.checksum, dots);
}

function generatePartialMatches(row, match, remainder, checksum, dots) {
    if (match.length > 0 && !match.match(row.condition.substring(0, match.length).replaceAll('.', '\\.').replaceAll('?', '[.#]'))) {
        return 0;
    }
    const minLength = [...checksum, ...dots].reduce((p, c) => p + c, 0);
    const dotsToAdd = remainder.length - minLength;
    if (dotsToAdd === 0) {
        const completeMatch = generateRemainingMatch(match, checksum, dots);
        return equalsChecksum(completeMatch, row.checksum) && completeMatch.match(row.condition.substring(0, completeMatch.length).replaceAll('.', '\\.').replaceAll('?', '[.#]')) ? 1 : 0;
    } else if (dots.length > 0) {
        return [...(checksum.length > 0 ? Array(dotsToAdd + 1).keys() : [dotsToAdd])].reduce((p, c) => {
            const key = cacheKey(remainder, checksum, dots, c);
            if (cache[key] !== undefined) return p + cache[key];
            const newMatch = match.padEnd(match.length + dots[0] + c, '.').padEnd(checksum.length > 0 ? match.length + dots[0] + c + checksum[0] : 0, '#');
            const newRemainder = remainder.substring(dots[0] + c + (checksum.length > 0 ? checksum[0] : 0));
            const numMatches = generatePartialMatches(row, newMatch, newRemainder, checksum.slice(1), dots.slice(1));
            addToCache(key, numMatches);
            return p + numMatches;
        }, 0)
    }
    return 0;
}

const cache = {};

function cacheKey(remainder, checksum, dots, c) {
    return `${remainder}-${checksum}-${dots}-${c}`;
}

function addToCache(key, numMatches) {
    cache[key] = numMatches;
}

function generateRemainingMatch(match, checksum, dots) {
    return dots.reduce((p, c, i) => {
        return p.padEnd(p.length + c, '.').padEnd(i < checksum.length ? p.length + c + checksum[i] : 0, '#');
    }, match);
}

function equalsChecksum(condition, checksum) {
    const c = getChecksum(condition);
    return checksum.length === c.length && checksum.every((v, i) => v === c[i]);
}

function getChecksum(condition) {
    return condition.match(/([.#])\1*/g).filter(s => s.startsWith('#')).map(s => s.length);
}

fs.readFile('525152b.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
