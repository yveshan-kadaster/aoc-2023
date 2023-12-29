const id = 'AOC 23b';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const moves = { D: { x: 0, y: 1 }, R: { x: 1, y: 0 }, L: { x: -1, y: 0 }, U: { x: 0, y: -1 } };
const moveKeys = Object.keys(moves);

const dataObserver = {
    next: (data) => {
        console.time(id);
        const maze = data.split('\n').filter((line) => !!line).reduce(scanMaze, { height: 0 });
        // console.log(maze);
        const nodes = findNodes(maze)
                .concat([{ x: 1, y: 0, special: 'Start' }, {
                    x: maze[maze.height - 1].width - 2, y: maze.height - 1, special: 'Finish'
                }])
                .map(connectNodeMapper(maze));
        // console.log(nodes);
        const maxTrack = findLongestTrack(nodes);
        console.log(maxTrack);
        console.timeEnd(id);
    }
};

function scanMaze(maze, line, y) {
    maze[y] = line.split('').reduce((p, c, x) => {
        p[x] = { c };
        if (x + 1 > p.width) p.width = x + 1;
        return p;
    }, { width: 0 });
    if (y + 1 > maze.height) maze.height = y + 1;
    return maze;
}

function findNodes(maze) {
    return Object.keys(maze).reduce((nodes, y) => {
        return nodes.concat(Object.keys(maze[y]).reduce((nodes, x) => {
            if (isValidLocation({ x, y }, [], maze) && moveKeys.reduce((p, c) => {
                return p + (isValidLocation({ x: +x + moves[c].x, y: +y + moves[c].y }, [], maze) ? 1 : 0);
            }, 0) > 2) {
                nodes.push({ x: +x, y: +y });
            }
            return nodes;
        }, []));
    }, []);
}

function connectNodeMapper(maze) {
    return (node, _, nodes) => {
        moveKeys.forEach(direction => {
            const move = moves[direction];
            const nextStep = { x: node.x + move.x, y: node.y + move.y };
            if (isValidLocation(nextStep, [], maze)) {
                node[direction] = getConnectedNode({
                    x: node.x, y: node.y, direction, trail: [toTrailItem(node)]
                }, maze, nodes);
            }
        });
        return node;
    };
}

function getConnectedNode(start, maze, nodes) {
    const stack = [start];
    let distance = 0;
    while (stack.length > 0) {
        distance++;
        const location = stack.pop();
        const move = moves[location.direction];
        const newLocation = { x: location.x + move.x, y: location.y + move.y };
        if (nodes.some(n => n.x === newLocation.x && n.y === newLocation.y)) {
            return { ...newLocation, distance };
        } else {
            moveKeys.forEach(k => {
                const nextMove = moves[k];
                const nextLocation = { x: newLocation.x + nextMove.x, y: newLocation.y + nextMove.y };
                if (isValidLocation(nextLocation, location.trail, maze)) {
                    stack.push({
                        ...newLocation, direction: k, trail: [...location.trail, toTrailItem(newLocation)],
                    });
                }
            });
        }
    }
}

function toTrailItem(location) {
    return `${location.x}-${location.y}`;
}

function isValidLocation(location, trail, maze) {
    return location.y >= 0 && location.y < maze.height && location.x >= 0 && location.x < maze[location.y].width &&
            !trail.includes(toTrailItem(location)) &&
            (!maze || maze[location.y][location.x].c !== '#');
}

function findLongestTrack(nodes) {
    let maxTrack = 0;
    const start = nodes.find(n => n.special === 'Start');
    const finish = nodes.find(n => n.special === 'Finish');
    const queue = [{ ...start, distance: 0, trail: [] }];
    while (queue.length > 0) {
        const location = queue.pop();
        if (location.x === finish.x && location.y === finish.y) {
            if (location.distance > maxTrack) {
                maxTrack = location.distance;
                console.log('F', maxTrack);
            }
        } else {
            moveKeys.forEach(direction => {
                if (location[direction] && isNotVisitedNode(location[direction], location.trail)) {
                    queue.push({
                        ...nodes.find(n => n.x === location[direction].x && n.y === location[direction].y),
                        distance: location.distance + location[direction].distance,
                        trail: [...location.trail, toTrailItem(location[direction])],
                    });
                }
            });
        }
    }
    return maxTrack;
}

function isNotVisitedNode(location, trail) {
    return !trail.includes(toTrailItem(location));
}

fs.readFile('aoc-023.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
