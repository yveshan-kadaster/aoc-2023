console.log('AOC 2b');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        const lines = data.split('\n').filter((line) => !!line);
        const mappedLines = lines.map(mapLine);
        console.log(mappedLines.reduce((p, c) => p + c, 0));
    }
};

function mapLine(line) {
    const match = line.match(/Game (\d+): (.*)/);
    const grabs = match[2].split(';').map((grabAsString) => grabAsString.trim()).map(mapToGrab);
    const bag = calculateMinimumBag(grabs);
    return bag['red'] * bag['green'] * bag['blue'];
}

function mapToGrab(grabAsString) {
    return grabAsString.split(',').map(mapToGrabPerColor).reduce((p, c) => ({...p, ...c}), {});
}

function mapToGrabPerColor(grabPerColorAsString) {
    const match = grabPerColorAsString.match(/(\d+) (red|green|blue)/);
    return { [match[2]]: +match[1] };
}

function calculateMinimumBag(grabs) {
    return {
        red: getMaxOfColor(grabs, 'red'),
        green: getMaxOfColor(grabs, 'green'),
        blue: getMaxOfColor(grabs, 'blue')
    };
}

function getMaxOfColor(grabs, color) {
    return Math.max(...(grabs.map((grab) => grab[color] || 0)));
}

fs.readFile('2286b.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
