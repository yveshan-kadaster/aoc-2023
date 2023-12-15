console.log('AOC 13b');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time('AOC 13b');
        const rows = data.split('\n');
        const areas = rows.reduce((p, c) => {
            if (!!c) {
                p[p.length - 1].push(c);
            } else {
                p.push([]);
            }
            return p;
        }, [[]]).filter((a) => a.length > 0);
        const mirrors = areas.map(findSmudgeReflection).filter(r => r[2]);
        const mirrorLines = mirrors.map(v => v[0]).reduce((p, c) => p + c, 0);
        console.log('Result: ', mirrorLines);
        console.timeEnd('AOC 13b');
    }
};

function smudge(area) {
    return area.flatMap(((row, y) => {
        return [...Array(row.length).keys()].map(x => {
            return smudgedAreaAt(area, x, y);
        })
    }));
}

function smudgedAreaAt(area, x, y) {
    return area.map((row, i) => {
        if (i === y) {
            const replacement = smudgeReplacement(row.charAt(x));
            return row.substring(0, x) + replacement + row.substring(x + replacement.length);
        }
        return row;
    });
}

function smudgeReplacement(s) {
    return s === '.' ? '#' : '.';
}

function flip(area) {
    return area[0].split('').reduce((p, _, i) => {
        p.push(area.reduce((p, c) => p.concat(c.charAt(i)), ''));
        return p;
    }, []);
}

function findSmudgeReflection(area, i) {
    const reflection = findReflection(area).filter(r => r[2])[0] || [0, 0, false];
    const flipReflection = findReflection(flip(area)).filter(r => r[2])[0] || [0, 0, false];
    const smudgeReflections = smudge(area).flatMap(findReflection).filter(r => r[2] && (!reflection[2] || r[0] !== reflection[0]));
    const smudgeFlipReflections = smudge(flip(area)).flatMap(findReflection).filter(r => r[2] && (!flipReflection[2] || r[0] !== flipReflection[0]));
    if (smudgeReflections.length > 0 && smudgeReflections[0][2]) return h(smudgeReflections[0]);
    if (smudgeFlipReflections.length > 0 && smudgeFlipReflections[0][2]) return smudgeFlipReflections[0];
    return reflection[2] ? h(reflection) : flipReflection;
}

function h(reflection) {
    return [reflection[0] * 100, reflection[1], reflection[2]]
}

function findReflection(area) {
    return [...Array(area.length - 1).keys()]
            .map((line) => findReflectionOnLine(area, line))
            .reduce((p, c) => {
                return c[2] ? [...p, c] : p;
            }, [[0, 0, false]])
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

fs.readFile('aoc-013.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
