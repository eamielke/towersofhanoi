const workercode = () => {

    function Move(moveCount, disc, sourceTowerNumber, sourceTowerDiscs, targetTowerNumber, targetTowerDiscs, endingTowerStates) {
        this._moveCount = moveCount;
        this._disc = disc;
        this._sourceTowerNumber = sourceTowerNumber;
        this._sourceTowerDiscs = sourceTowerDiscs;
        this._targetTowerNumber = targetTowerNumber;
        this._targetTowerDiscs = targetTowerDiscs;
        this._endingTowerStates = endingTowerStates;
    }

    Move.prototype.getMoveCount = function () {
        return this._moveCount;
    };

    Move.prototype.getDisc = function () {
        return this._disc;
    };

    Move.prototype.getSourceTowerNumber = function () {
        return this._sourceTowerNumber;
    };

    Move.prototype.getSourceTowerDiscs = function () {
        return this._sourceTowerDiscs;
    };

    Move.prototype.getTargetTowerNumber = function () {
        return this._targetTowerNumber;
    };

    Move.prototype.getTargetTowerDiscs = function () {
        return this._targetTowerDiscs;
    };

    Move.prototype.getMoveDesc = function () {
        return "Moved disc " + this._disc + " from tower " + this._sourceTowerNumber.getTowerNumber() + " to tower "
            + this._targetTowerNumber;
    };

    Move.prototype.getEndingTowerStates = function () {
        return this._endingTowerStates;
    };

    function Tower(initialTower, solutionString, towerNo, discsArray) {

        this.initial = initialTower;

        this.solution = solutionString;

        this.towerNumber = towerNo;

        if (discsArray) {
            this.discs = discsArray;
        } else {
            this.discs = [];
        }

        this.previousDiscs = [];


    }

    Tower.createFrom = function (tower) {

        let discArray = Array.from(tower.getDiscs());

        return new Tower(tower.getInitial(), tower.getSolution(), tower.getTowerNumber(), discArray);
    };

    Tower.copyArray = function (arrayToCopy) {
        return (Array.from(arrayToCopy));
    };

    Tower.prototype.addDisc = function (disc) {
        if (this.discs.length === 0) {
            this.previousDiscs = Tower.copyArray(this.discs);
            this.discs.push(disc);
            return true;
        } else if (this.discs[this.discs.length - 1] <= disc) {
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
    };

    Tower.prototype.removeTopDisc = function () {
        if (this.discs && this.discs.length > 0) {
            this.previousDiscs = Tower.copyArray(this.discs);
            return this.discs.pop();
        }
    };

    Tower.prototype.getDiscOrder = function () {
        return this.discs.join('');
    };

    Tower.prototype.getDesc = function () {
        return "Tower number: " + this.towerNumber + " Disc order: " + this.getDiscOrder();
    };

    Tower.prototype.getDiscs = function () {
        return this.discs;
    };

    Tower.prototype.getSolution = function () {
        return this.solution;
    };

    Tower.prototype.getTopDisc = function () {
        if (this.discs && this.discs.length > 0) {
            return this.discs[this.discs.length - 1];
        } else {
            return null;
        }

    };

    Tower.prototype.getTowerNumber = function () {
        return this.towerNumber;
    };

    Tower.prototype.getIsSolved = function () {
        return (this.getDiscOrder() === this.solution && this.getInitial() === false);
    };

    Tower.prototype.getInitial = function () {
        return this.initial;
    };


    onmessage = function (e) {

        let previousDisk = -1;

        let towerArray = [];

        let moveHistory = [];

        let moveCount = 0;

        let maxMoves = 0;

        let maxDiscs = 21;

        let progressInterval = 1;


        function setupTowers(discCount) {

            console.log('Worker Setting up tower array');

            let discArray = [];

            for (let j = discCount; j > 0; j--) {
                discArray.push(j);
            }

            maxMoves = Math.pow(2, (discArray.length));

            progressInterval = Math.floor(maxMoves/100);
            if (Math.floor(progressInterval) == 0) {
                progressInterval = 1;
            }

            previousDisk = -1;
            moveCount = 0;

            let solution = discArray.join('');

            towerArray.splice(0, towerArray.length);
            towerArray = [];
            moveHistory.splice(0, towerArray.length);
            moveHistory = [];

            towerArray.push(new Tower(true, solution, 1, discArray));
            towerArray.push(new Tower(false, solution, 2));
            towerArray.push(new Tower(false, solution, 3));

            console.log('worker tower array initial: ' + JSON.stringify(towerArray));

        }

        function solvePuzzle() {

            let solved = false;
            let iterationCount = 1;

            console.log('Worker Prior to loop start - Solved: ' + solved + " iterationCount: "
                + iterationCount + " max moves: " + maxMoves);

            console.log('Worker solve puzzle - initial tower state: ' + JSON.stringify(towerArray));

            while (!solved && iterationCount <= maxMoves) {


                performMove(towerArray);

                solved = testSolved(towerArray);

                iterationCount++;

            }

            return solved;

        }

        function performMove(towerArray) {

            let moved = false;

            for (let i = 0; i < towerArray.length; i++) {
                let tower = towerArray[i];

                let disc = tower.getTopDisc();

                if (disc && (disc !== previousDisk)) {

                    moved = findTargetTower(i + 1, towerArray, disc, tower, moved);

                    if (moved) {
                        return moved;
                    } else {
                        //Wrap around
                        moved = findTargetTower(0, towerArray, disc, tower, moved);
                    }
                }
            }
            return moved;
        }

        function findTargetTower(i, towerArray, disc, sourceTower) {

            let moved = false;

            for (let k = i; k < towerArray.length; k++) {

                let targetTower = towerArray[k];

                let sourceTowerNumber = sourceTower.getTowerNumber();
                let sourceDiscs = sourceTower.getDiscs().length;
                let targetTowerNumber = targetTower.getTowerNumber();
                let targetDiscs = targetTower.getDiscs().length;

                let success = targetTower.addDisc(disc);

                if (success) {

                    //Key logic
                    moveCount++;
                    previousDisk = disc;

                    sourceTower.removeTopDisc();

                    //Logging and tracking logic.

                    let move = new Move(moveCount, disc, sourceTowerNumber,
                        sourceDiscs, targetTowerNumber,
                        targetDiscs,
                        cloneTowerArray(towerArray));

                    moved = true;

                    let notify = (moveCount % progressInterval) === 0;

                    if (discCount < maxDiscs) {
                        moveHistory.push(move);
                    }

                    if (notify || (moveCount === maxMoves -1 && moveHistory.length > 0)) {
                        postMessage({event: 'Progress', data:{progress: Math.ceil((moveCount/maxMoves)*100),
                                moveCount: moveCount, moveHistory: moveHistory}});

                        moveHistory.splice(0, moveHistory.length);
                        moveHistory = [];
                    }

                    break;
                }

            }
            return moved;
        }

        function cloneTowerArray(towerArray) {
            let clonedTowerArray = [];
            for (let i = 0; i < towerArray.length; i++) {
                clonedTowerArray.push(Tower.createFrom(towerArray[i]));
            }

            return clonedTowerArray;
        }

        function testSolved(towerArray) {

            let solved = false;
            for (let i = 0; i < towerArray.length; i++) {

                if (towerArray[i].getIsSolved()) {
                    solved = true;
                    break;
                }
            }

            return solved;
        }

        let discCount = e.data.data;
        console.log('Solving puzzle in worker thread for discs: ' + discCount);
        setupTowers(discCount);

        let solveResult = solvePuzzle();

        console.log('Final tower state: ' + JSON.stringify(towerArray));

        postMessage({event: 'Success', data: {moveCount: moveCount,
                solved: solveResult, towerArray: towerArray}});
    };
};

let code = workercode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

const blob = new Blob([code], {type: "application/javascript"});
const worker_script = URL.createObjectURL(blob);

export default worker_script;
