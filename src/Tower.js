class Tower {


    initial = false;

    discs = [];

    towerNumber = 0;


    constructor(initial, solution, towerNumber, discs) {

        this.initial = initial;

        this.towerNumber = towerNumber;

        if (discs) {
            this.discs = discs;
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

    getTowerNumber() {
        return this.towerNumber;
    }

    getInitial() {
        return this.initial;
    }
}

export default Tower;