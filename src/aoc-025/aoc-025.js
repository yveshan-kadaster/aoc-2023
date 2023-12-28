const id = 'AOC 25';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const minimalClusterSize = 4;

const dataObserver = {
    next: (data) => {
        console.time(id);
        const getWiring = () => data.split('\n').filter((line) => !!line).reduce(scanWiring, {});
        const clusters = doClustering(getWiring);
        console.log('Result:', Object.keys(clusters[0]).length * Object.keys(clusters[1]).length);
        console.timeEnd(id);
    }
};

function scanWiring(wiring, line) {
    const connections = line.split(':').map(s => s.trim());
    const from = connections[0];
    if (!wiring[from]) wiring[from] = { connections: [] };
    const tos = connections[1].split(' ');
    tos.forEach(t => {
        if (!wiring[t]) wiring[t] = { connections: [] };
        wiring[t].connections.push(from);
        wiring[from].connections.push(t);
    })
    return wiring;
}

function doClustering(getWiring) {
    let numConnections = 100;
    const clusters = [{}, {}];
    do {
        const wiring = getWiring();
        clusters[0] = {};
        clusters[1] = {};
        initializeClusters(clusters, wiring)
        shuffleConnections(clusters, wiring);
        numConnections = countConnectionsBetweenClusters(clusters, wiring);
    } while (Object.keys(clusters[0]).length < minimalClusterSize ||
             Object.keys(clusters[1]).length < minimalClusterSize ||
             numConnections.numClusterConnections > 3)
    return clusters;
}

function initializeClusters(clusters, wiring) {
    const randomPositioningThreshold = 0.1;
    const nodes = Object.keys(wiring);
    addRandomNodeToCluster(clusters[0], nodes, wiring);
    addRandomNodeToCluster(clusters[1], nodes, wiring);
    nodes.forEach(node => {
        const clusters0 = [{...clusters[0], [node]: wiring[node] }, { ...clusters[1] }];
        const clusters1 = [{...clusters[0] }, { ...clusters[1], [node]: wiring[node] }];
        const connections0 = countConnectionsBetweenClusters(clusters0, wiring);
        const connections1 = countConnectionsBetweenClusters(clusters1, wiring);
        if (connections0.numClusterConnections < connections1.numClusterConnections) {
            clusters[0][node] = wiring[node];
        } else {
            if (Object.keys(clusters[0]).length > Object.keys(clusters[1]).length && Math.random() > randomPositioningThreshold) {
                clusters[1][node] = wiring[node];
            } else {
                clusters[Math.floor(Math.random() * 2)][node] = wiring[node];
            }
        }
    });
}

function shuffleConnections(clusters, wiring) {
    const randomShufflingThreshold = 0.4;
    let count = 100000;
    while (count > 0) {
        if (Object.keys(clusters[0]).length < minimalClusterSize || Object.keys(clusters[1]).length < minimalClusterSize) {
            console.log('Cluster too small', clusters.map(c => Object.keys(c).length));
            return;
        }
        const connections0 = countConnectionsBetweenClusters(clusters, wiring);
        if (count % 100 === 0) console.log(connections0.numClusterConnections);
        const notZeroConnections0 = connections0.connectedWiring.filter(c => Object.values(c)[0] !== 0)
                .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);
        const connections1 = countConnectionsBetweenClusters([clusters[1], clusters[0]], wiring);
        const notZeroConnections1 = connections1.connectedWiring.filter(c => Object.values(c)[0] !== 0)
                .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);
        if (connections0.numClusterConnections <= 3) break;
        const sortedNotZeroConnections = [...notZeroConnections0, ...notZeroConnections1]
                .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);
        const sortedNotZeroConnectionsHigh = sortedNotZeroConnections.filter(n => Object.values(n)[0] > 2);
        const toSwap = (sortedNotZeroConnectionsHigh.length > 0 && Math.random() > randomShufflingThreshold) || Math.random() > randomShufflingThreshold
                ? sortedNotZeroConnectionsHigh[Math.floor(Math.random() * sortedNotZeroConnectionsHigh.length)]
                : sortedNotZeroConnections[Math.floor(Math.random() * sortedNotZeroConnections.length)];
        if (toSwap) {
            if (clusters[0][Object.keys(toSwap)[0]]) {
                delete clusters[0][Object.keys(toSwap)[0]];
                clusters[1][Object.keys(toSwap)[0]] = wiring[Object.keys(toSwap)[0]];
            } else {
                delete clusters[1][Object.keys(toSwap)[0]];
                clusters[0][Object.keys(toSwap)[0]] = wiring[Object.keys(toSwap)[0]];
            }
        }
        count--;
    }
}

function addRandomNodeToCluster(cluster, nodes, wiring) {
    const nodeCount = nodes.length;
    const nodeNum = Math.floor(Math.random() * nodeCount);
    cluster[nodes[nodeNum]] = wiring[nodes[nodeNum]]
    nodes.splice(nodeNum, 1);
}

function countConnectionsBetweenClusters(clusters, wiring) {
    const nodes0 = Object.keys(clusters[0]);
    const nodes1 = Object.keys(clusters[1]);
    const connectedWiring = nodes0.map(node => {
        const connections = wiring[node].connections;
        const count = connections.reduce((p, c) => {
            return p + (nodes1.includes(c) ? 1 : 0);
        }, 0);
        return { [node]: count };
    });
    const numClusterConnections = connectedWiring.reduce((p, c) => {
        return p + Object.values(c)[0];
    }, 0);
    return { connectedWiring, numClusterConnections };
}

fs.readFile('aoc-025.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
