const id = 'AOC 19';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time(id);
        const rows = data.split('\n');
        const [workflowsText, partsText] = rows.reduce((p, c) => {
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
        const parts = partsText.map(scanParts);
        console.log(process(parts, workflows).map(addRatings).reduce((p, c) => p + c, 0));
        console.timeEnd(id);
    }
};

function scanRules(text) {
    const [, name, rulesString] = text.match(/(.*)\{(.*)}/);
    const rules = rulesString.split(',').map(r => r.split(':'));
    return { name, rules };
}

function scanParts(text) {
    return text.match(/\{(.*)}/)[1].split(',');
}

function process(parts, workflows) {
    return parts.reduce((p, part) => {
        if (processPart(part, workflows)) p.push(part);
        return p;
    }, []);
}

function processPart(part, workflows) {
    const context = part.map(p => `const ${p};`).join('');
    return applyWorkflow('in', context, workflows);
}

function applyWorkflow(name, context, workflows) {
    if (name === 'A') return true;
    if (name === 'R') return false;
    const workflow = workflows[name];
    let n = 0;
    while (true) {
        if (workflow[n].length <= 1) return applyWorkflow(workflow[n][0], context, workflows);
        const rule = workflow[n][0] + ';';
        const target = workflow[n][1];
        const result = eval(context + rule);
        if (result) return applyWorkflow(target, context, workflows);
        n = n + 1;
    }
}

function addRatings(part) {
    const context = part.map(p => `const ${p};`).join('');
    return eval(context + 'x + m + a + s;');
}

fs.readFile('19114.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
//167409079868000
