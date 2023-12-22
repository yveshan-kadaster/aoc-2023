const id = 'AOC 20b';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time(id);
        const modules = initializeNetwork(wireNetwork(data.split('\n').filter((line) => !!line).reduce(scanModules, {})));
        let n = 1;
        let network = { modules };
        const highInputs = network.modules[network.modules['rx'].inputs[0]].inputs;
        const counts = highInputs.reduce((p, c) => {
            p[c] = 0;
            return p;
        }, {});
        const initialPulse = { module: 'broadcaster', state: 'low', source: 'button-module' };
        while (highInputs.some(c => !counts[c])) {
            network = processQueue(network, [initialPulse], n, counts);
            n++;
        }
        console.log(Object.keys(counts).reduce((p, k) => p * counts[k], 1));
        console.timeEnd(id);
    }
};

function scanModules(modules, line) {
    const module = scanModule(line.split('->').map(s => s.trim()));
    modules[module.name] = module;
    return modules;
}

function wireNetwork(modules) {
    Object.keys(modules).forEach(m => modules[m].destinations.forEach(d => {
        if (!modules[d]) modules[d] = createModule('output', d, [], [], 'off', processOutput);
    }));
    Object.keys(modules).forEach(m => modules[m].destinations.forEach(d => modules[d].inputs.push(m)));
    return modules;
}

function initializeNetwork(modules) {
    Object.keys(modules).forEach(m => {
        if (modules[m].type === 'conjunction') modules[m].inputs.forEach(i => modules[m].state[i] = 'low');
    })
    return modules;
}

function scanModule([moduleString, destinations]) {
    const destinationArray = destinations.split(',').map(s => s.trim());
    const moduleMatch = moduleString.match(/(broadcaster|(%)(.*)|(&)(.*))/);
    if (moduleMatch[4])
        return createModule('conjunction', moduleMatch[5], destinationArray, [], {}, processConjunction);
    if (moduleMatch[2])
        return createModule('flip-flop', moduleMatch[3], destinationArray, [], 'off', processFlipflop);
    return createModule('broadcaster', 'broadcaster', destinationArray, [], {}, processBroadcaster);
}

function createModule(type, name, destinations, inputs, state, process) {
    return { type, name, destinations, inputs, state, process }
}

function processQueue(network, queue, n, counts) {
    while (queue.length > 0) {
        const before = Object.keys(counts).reduce((p, k) => {
            p[k] = 0;
            return p;
        }, {})
        const pulse = queue.shift();
        network.modules[pulse.module].process(network, queue, pulse);
        Object.keys(counts).forEach(k => {
           if (before[k] !== network.modules['th'].state[k] && network.modules['th'].state[k] === 'high') counts[k] = n;
        });
    }
    return network;
}

function processBroadcaster(network, queue, pulse) {
    sendPulse(network, queue, pulse.module, 'low');
}

function processFlipflop(network, queue, pulse) {
    if (pulse.state === 'low') {
        if (network.modules[pulse.module].state === 'off') {
            network.modules[pulse.module].state = 'on';
            sendPulse(network, queue, pulse.module, 'high');
        } else {
            network.modules[pulse.module].state = 'off';
            sendPulse(network, queue, pulse.module, 'low');
        }
    }
}

function processConjunction(network, queue, pulse) {
    const allHigh = () => {
        return Object.keys(network.modules[pulse.module].state)
                .every(k => network.modules[pulse.module].state[k] === 'high')
    };
    network.modules[pulse.module].state[pulse.source] = pulse.state;
    sendPulse(network, queue, pulse.module, allHigh() ? 'low' : 'high');
}

function processOutput(network, queue, pulse) {
    network.modules[pulse.module].state = pulse.state;
}

function sendPulse(network, queue, thisModule, state) {
    network.modules[thisModule].destinations.forEach(d => {
        queue.push({ module: d, state, source: thisModule })
    });
}

fs.readFile('aoc-020.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
