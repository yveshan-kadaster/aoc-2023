const id = 'AOC 23';
console.log(id);

const fs = require('node:fs');
const { Subject } = require("rxjs");

const moves = { L: { x: -1, y: 0, r: 'R' }, R: { x: 1, y: 0, r: 'L' }, U: { x: 0, y: -1, r: 'D' }, D: { x: 0, y: 1 , r: 'U'} };
const moveKeys = Object.keys(moves);

const dataObserver = {
    next: (data) => {
        console.time(id);
        const maze = data.split('\n').filter((line) => !!line).reduce(scanMaze, { height: 0 });
        const maxTrack = hikeMaze(maze, [{ x: 1, y: 0, distance: 0, direction: 'D' }]);
        console.log(maxTrack)
        console.timeEnd(id);
    }
};

function scanMaze(maze, line, y) {
    maze[y] = line.split('').reduce((p, c, x) => {
        p[x] = { c };
        return p;
    }, {});
    if (y + 1 > maze.height) maze.height = y + 1;
    return maze;
}

function hikeMaze(maze, stack) {
    let maxTrack = 0;
    while (stack.length > 0) {
        const location = stack.pop();
        const move = moves[location.direction];
        const newLocation = { x: location.x + move.x, y: location.y + move.y };
        if (newLocation.y === maze.height - 1 && maxTrack < location.distance + 1) maxTrack = location.distance + 1;
        moveKeys.forEach(k => {
            const nextMove = moves[k];
            const nextLocation = { x: newLocation.x + nextMove.x, y: newLocation.y + nextMove.y };
            if (isValidMoveLocation(nextLocation, k, location.direction, maze)) {
                stack.push({ ...newLocation, direction: k, distance: location.distance + 1 });
            }
        });
    }
    return maxTrack;
}

function isValidMoveLocation(location, direction, previousDirection, maze) {
    return location.y >= 0 && location.y < maze.height &&
            moves[previousDirection].r !== direction &&
            maze[location.y][location.x].c !== '#' &&
            !(direction ==='L' && maze[location.y][location.x].c === '>') &&
            !(direction ==='R' && maze[location.y][location.x].c === '<') &&
            !(direction ==='U' && maze[location.y][location.x].c === 'v') &&
            !(direction ==='D' && maze[location.y][location.x].c === '^');
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
