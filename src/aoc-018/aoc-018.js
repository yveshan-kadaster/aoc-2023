const id = 'AOC 18';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const directionChange = { LD: 'L', DR: 'L', RU: 'L', UL: 'L', LU: 'R', UR: 'R', RD: 'R', DL: 'R' };
const inflation = {
    RR: { x: 1, y: -1 }, DR: { x: 1, y: 1 }, LR: { x: -1, y: 1 }, UR: { x: -1, y: -1 },
    RL: { x: -1, y: -1 }, DL: { x: 1, y: -1 }, LL: { x: 1, y: 1 }, UL: { x: -1, y: 1 }
};

const dataObserver = {
    next: (data) => {
        console.time(id);
        const digPlan = data.split('\n').filter((line) => !!line).reduce(createDigPlan, [])
        const trench = digPlan.reduce(digTrench, { x: 0, y: 0, trench: [] }).trench;
        const sum = [...Array(trench.length).keys()].reduce((p, c, i) => {
            return p + trench[i].x * (trench[i + 1] || trench[0]).y - (trench[i + 1] || trench[0]).x * trench[i].y;
        }, 0)
        // const clockwise = sum > 0;
        const result = Math.abs(sum) / 2;
        console.log(result);
        console.timeEnd(id);
    }
};

function createDigPlan(digPlan, line) {
    const match = line.match(/([RDLU])\s+(\d+)\s+\(#([^)]{6})\)/);
    digPlan.push({ heading: match[1], size: +match[2], color: match[3] });
    return digPlan;
}

function digTrench(digged, plan, i, digPlan) {
    switch (plan.heading) {
        case 'R':
            digged.x = digged.x + plan.size;
            break;
        case 'L':
            digged.x = digged.x - plan.size;
            break;
        case 'U':
            digged.y = digged.y - plan.size;
            break;
        case 'D':
            digged.y = digged.y + plan.size;
            break;
    }
    const nextHeading = (digPlan[i + 1] || digPlan[0]).heading;
    const headingChange = directionChange[plan.heading + nextHeading];
    const dxy = inflation[plan.heading + headingChange];
    digged.trench.push({ xx: digged.x, yy: digged.y, x: digged.x + 0.5 * dxy.x, y: digged.y + 0.5 * dxy.y });
    return digged;
}

fs.readFile('62.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
