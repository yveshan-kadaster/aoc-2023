console.log('AOC 7');

const fs = require('node:fs');
const { Subject } = require("rxjs");

const dataObserver = {
    next: (data) => {
        console.log(data.split('\n').filter((line) => !!line)
                .map(mapLine)
                .sort(sortHand)
                .reduce((p, c, i) => p + c.bid * (i + 1), 0)
        );
    }
};

function mapLine(line) {
    const match = line.match(/(.*) (\d+)/);
    return { cards: match[1], bid: +match[2]};
}

const cardsToValueReducer = (p, card) => p * 100 + mapToValue(card);
const handValue = (hand) => hand.cards.split('').reduce(cardsToValueReducer, 0);
function sortHand(a, b) {
    return (handType(a) - handType(b)) || (handValue(a) - handValue(b))
}

function handType(hand) {
    const cards = hand.cards.split('').sort();
    const countsPerCard = cards.reduce(function(p, card) {
        p[card] = (p[card] || 0) + 1;
        return p;
    }, {});
    const counts = Object.values(countsPerCard).sort().reduce((p, c) => `${p}${c}`, '');
    switch(counts) {
        case '5': return 7;
        case '14': return 6;
        case '23': return 5;
        case '113': return 4;
        case '122': return 3;
        case '1112': return 2;
        case '11111': return 1;
        default: return 0;
    }
}

function mapToValue(card) {
    switch(card) {
        case 'A': return 13;
        case 'K': return 12;
        case 'Q': return 11;
        case 'J': return 10;
        case 'T': return 9;
        case '9': return 8;
        case '8': return 7;
        case '7': return 6;
        case '6': return 5;
        case '5': return 4;
        case '4': return 3;
        case '3': return 2;
        case '2': return 1;
        default: return 0;
    }
}

fs.readFile('6440.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
