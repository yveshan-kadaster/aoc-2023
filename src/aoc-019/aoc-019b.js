const id = 'AOC 19';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time(id);
        const rows = data.split('\n');
        const [workflowsText,] = rows.reduce((p, c) => {
            if (!!c) {
                p[p.length - 1].push(c);
            } else {
                p.push([]);
            }
            return p;
        }, [[]]).filter((a) => a.length > 0);
        const workflows = workflowsText.map(scanRules).reduce((p, c) => {
            p[c.name] = c.rules;
            return p;
        }, {});
        const { accept: acceptRules } = mergeWorkflows('in', workflows, '', { accept: [], reject: [] });
        console.log(acceptRules.reduce(calculateAcceptedRanges, []).reduce(calculatePartsCounts, 0))
        console.timeEnd(id);
    }
};

function scanRules(text) {
    const [, name, rulesString] = text.match(/(.*)\{(.*)}/);
    const rules = rulesString.split(',').map(r => r.split(':'));
    return { name, rules };
}

function mergeWorkflows(name, workflows, prefix, rules) {
    if (name === 'A' || name === 'R') {
        if (name === 'A') rules.accept.push(prefix);
        else rules.reject.push(prefix);
        return rules;
    }
    const workflow = workflows[name];
    let n = 0;
    while (true) {
        if (workflow[n].length <= 1) return mergeWorkflows(workflow[n][0], workflows, prefix, rules);
        rules = mergeWorkflows(workflow[n][1], workflows, prefix + (prefix.length === 0 ? '' : ';') + workflow[n][0], rules);
        prefix = prefix + (prefix.length === 0 ? '' : ';') +invertRule(workflow[n][0]);
        n = n + 1;
    }
}

function invertRule(rule) {
    const match = rule.match(/([xmas])([<>])(.*)/);
    return match[2] === '<' ? `${match[1]}>${+match[3] - 1}` : `${match[1]}<${+match[3] + 1}`;
}

const ruleReplacements = [
    ['x<', 'part.x.max=Math.min(part.x.max, '],
    ['m<', 'part.m.max=Math.min(part.m.max, '],
    ['a<', 'part.a.max=Math.min(part.a.max, '],
    ['s<', 'part.s.max=Math.min(part.s.max, '],
    ['x>', 'part.x.min=Math.max(part.x.min, '],
    ['m>', 'part.m.min=Math.max(part.m.min, '],
    ['a>', 'part.a.min=Math.max(part.a.min, '],
    ['s>', 'part.s.min=Math.max(part.s.min, '],
];

function calculateAcceptedRanges(p, rule) {
    const context = "const part = { x: { min: 0, max: 4001 }, m: { min: 0, max: 4001 }, a: { min: 0, max: 4001 }, s: { min: 0, max: 4001 } };";
    const evaluation = ruleReplacements.reduce((p, c) => p.replaceAll(c[0], c[1]), rule) + '; part';
    p.push(eval(context + evaluation.replaceAll(';', ');')));
    return p;
}

function calculatePartsCounts(p, c) {
    return p + calculatePiece(c.x) * calculatePiece(c.m) * calculatePiece(c.a) * calculatePiece(c.s);
}

function calculatePiece(piece) {
    return piece.max - piece.min - 1;
}

fs.readFile('167409079868000b.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
