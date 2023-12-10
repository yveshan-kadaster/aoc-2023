console.log('AOC 2');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const bagContents = { 'red': 12, 'green': 13, 'blue': 14 };

const dataObserver = {
    next: (data) => {
        const lines = data.split('\n').filter((line) => !!line);
        const mappedLines = lines.map(mapLine);
        console.log(mappedLines.reduce((p, c) => p + c, 0));
    }
};

function mapLine(line) {
    const match = line.match(/Game (\d+): (.*)/);
    const gameId = +match[1];
    const grabs = match[2].split(';').map((grabAsString) => grabAsString.trim()).map(mapToGrab);
    return isPossibleGrabFromBag(grabs, bagContents) ? gameId : 0;
}

function mapToGrab(grabAsString) {
    return grabAsString.split(',').map(mapToGrabPerColor);
}

function mapToGrabPerColor(grabPerColorAsString) {
    const match = grabPerColorAsString.match(/(\d+) (red|green|blue)/);
    return { [match[2]]: +match[1] };
}

function isPossibleGrabFromBag(grabs, bag) {
    return grabs.every((grab) => grab.every((color) => {
        const key = Object.keys(color)[0];
        return color[key] <= bag[key];
    }))
}

fs.readFile('8.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
