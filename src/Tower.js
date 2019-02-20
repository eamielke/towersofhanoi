class Tower {

    //contains an array
    initial = false;

    solution = '321';

    discs = [];

    previousDiscs = [];

    towerNumber = 0;

    static createFrom(tower) {

        let discArray = Array.from(tower.getDiscs());

        return new Tower(tower.getInitial(), tower.getSolution(), tower.getTowerNumber(), discArray);
    }


    constructor(initial, solution, towerNumber, discs) {

        this.initial = initial;

        this.solution = solution;

        this.towerNumber = towerNumber;

        if (discs) {
            this.discs = discs;
        }

        this.previousDiscs = [];
    }

    addDisc(disc) {
        if (this.discs.length === 0) {
            this.previousDiscs = Tower.copyArray(this.discs);
            this.discs.push(disc);
            return true;
        } else if (this.discs[this.discs.length - 1] <= disc ) {
            return false;
        } else {

            let testDiscs = Tower.copyArray(this.discs);

            testDiscs.push(disc);

            if (testDiscs.join('') === this.solution && this.initial) {
                return false;
            } else if (testDiscs.join('') !== this.previousDiscs.join('')) {
                this.previousDiscs = Tower.copyArray(this.discs);
                this.discs.push(disc);
                return true;
            } else {
                return false;
            }

        }
    }

    static copyArray(arrayToCopy) {
        return (Array.from(arrayToCopy));
    }

    removeTopDisc() {
        if (this.discs && this.discs.length > 0) {
            this.previousDiscs = Tower.copyArray(this.discs);
            return this.discs.pop();
        }
    }

    getDiscOrder() {
        return this.discs.join('');
    }

    getDesc() {
        return "Tower number: " + this.towerNumber + " Disc order: " + this.getDiscOrder();
    }

    getDiscs() {
        return this.discs;
    }

    getSolution() {
        return this.solution;
    }

    getTopDisc() {
        if (this.discs && this.discs.length > 0) {
            return this.discs[this.discs.length - 1];
        } else {
            return null;
        }

    }

    getTowerNumber() {
        return this.towerNumber;
    }

    getIsSolved() {
        return (this.getDiscOrder() === this.solution && this.getInitial() === false);
    }

    getInitial() {
        return this.initial;
    }
}

export default Tower;