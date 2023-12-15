console.log('AOC 13');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time('AOC 13');
        const rows = data.split('\n');
        const areas = rows.reduce((p, c) => {
            if (!!c) {
                p[p.length - 1].push(c);
            } else {
                p.push([]);
            }
            return p;
        }, [[]]).filter((a) => a.length > 0);
        const verticalMirrors = areas.map(findReflection).filter(r => r[2]);
        const horizontalMirrors = areas.map(flip).map(findReflection).filter(r => r[2]);
        const verticalMirrorLines = verticalMirrors.map(v => v[0]).reduce((p, c) => p + c, 0);
        const horizontalMirrorLines = horizontalMirrors.map(v => v[0]).reduce((p, c) => p + c, 0);
        console.log('Result: ', verticalMirrorLines * 100 + horizontalMirrorLines);
        console.timeEnd('AOC 13');
    }
};

function flip(area) {
    return area[0].split('').reduce((p, _, i) => {
        p.push(area.reduce((p, c) => p.concat(c.charAt(i)), ''));
        return p;
    }, []);
}

function findReflection(area) {
    return [...Array(area.length - 1).keys()]
            .map((line) => findReflectionOnLine(area, line))
            .reduce((p, c) => {
                return c[2] && c[1] >= p[1] ? c : p;
            }, [0, 0, false])
}

function findReflectionOnLine(area, startLine) {
    const range = Math.min(startLine + 1, area.length - startLine - 1);
    const mirror = [...Array(range).keys()].map(v => v + Math.max(0, startLine - range + 1));
    const isMirrorLine = mirror.every((line, i) => !!area[line].match(lineToRegex(area[startLine + range - i])));
    return [startLine + 1, range, isMirrorLine]
}

function lineToRegex(line) {
    return  line.replaceAll('.', '\\.');
}

fs.readFile('405.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
