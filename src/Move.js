class Move {

    constructor(moveCount, disc, sourceTowerNumber, sourceTowerDiscs, targetTowerNumber, targetTowerDiscs, endingTowerStates) {
        this._moveCount = moveCount;
        this._disc = disc;
        this._sourceTowerNumber = sourceTowerNumber;
        this._sourceTowerDiscs = sourceTowerDiscs;
        this._targetTowerNumber = targetTowerNumber;
        this._targetTowerDiscs = targetTowerDiscs;
        this._endingTowerStates = endingTowerStates;
    }

    get moveCount() {
        return this._moveCount;
    }

    get disc() {
        return this._disc;
    }

    get sourceTowerNumber() {
        return this._sourceTowerNumber;
    }

    get sourceTowerDiscs() {
        return this._sourceTowerDiscs;
    }

    get targetTowerNumber() {
        return this._targetTowerNumber;
    }

    get targetTowerDiscs() {
        return this._targetTowerDiscs;
    }

    get endingTowerStates() {
        return this._endingTowerStates;
    }

}

export default Move;