const id = 'AOC 20';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.time(id);
        const modules = initializeNetwork(wireNetwork(data.split('\n').filter((line) => !!line).reduce(scanModules, {})));
        let n = 1;
        let network = { modules, low: 0, high: 0 };
        const initialPulse =  { module: 'broadcaster', state: 'low', source: 'button-module' };
        while (n <= 1000) {
            network[initialPulse.state]++;
            network = processQueue(network, [initialPulse]);
            n++;
        }
        console.log(network.low * network.high);
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
        if (!modules[d]) modules[d] = createModule('output', d, [], [], 'low', processOutput);
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

function processQueue(network, queue) {
    while (queue.length > 0) {
        const pulse = queue.shift();
        network.modules[pulse.module].process(network, queue, pulse);
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
        network[state]++;
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
