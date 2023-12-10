console.log('AOC 7b');

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
    switch(`${counts}J${countsPerCard['J'] || 0}`) {
        case '5J5':
        case '14J4':
        case '23J3':
        case '23J2':
        case '14J1':
        case '5J0': return 7;
        case '113J1':
        case '113J3':
        case '122J2':
        case '14J0': return 6;
        case '122J1':
        case '23J0': return 5;
        case '1112J1':
        case '1112J2':
        case '113J0': return 4;
        case '122J0': return 3;
        case '11111J1':
        case '1112J0': return 2;
        case '11111J0': return 1;
        default: return 0;
    }
}

function mapToValue(card) {
    switch(card) {
        case 'A': return 13;
        case 'K': return 12;
        case 'Q': return 11;
        case 'J': return 1;
        case 'T': return 10;
        case '9': return 9;
        case '8': return 8;
        case '7': return 7;
        case '6': return 6;
        case '5': return 5;
        case '4': return 4;
        case '3': return 3;
        case '2': return 2;
        default: return 0;
    }
}

fs.readFile('5905b.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processor.next(data);
});

const processor = new Subject();
processor.asObservable().subscribe(dataObserver);
