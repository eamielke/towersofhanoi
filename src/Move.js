class Move {

    constructor(moveCount, disc, sourceTower, targetTower, targetTowerNumber, endingTowerStates) {
        this._moveCount = moveCount;
        this._disc = disc;
        this._sourceTower = sourceTower;
        this._targetTower = targetTower;
        this._targetTowerNumber = targetTowerNumber;
        this._endingTowerStates = endingTowerStates;
    }

    get moveCount() {
        return this._moveCount;
    }

    get disc() {
        return this._disc;
    }

    get sourceTower() {
        return this._sourceTower;
    }

    get targetTower() {
        return this._targetTower;
    }

    get targetTowerNumber() {
        return this._targetTowerNumber;
    }

    get moveDesc() {
        return "Moved disc " + this._disc + " from tower " + this._sourceTower + " to tower "
            + this._targetTowerNumber;
    }

    get endingTowerStates() {
        return this._endingTowerStates;
    }

}

export default Move;