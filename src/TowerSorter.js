import React, {Component} from 'react';
import Tower from "./Tower";
import MoveList from "./MoveList";
import ThreeScene from "./ThreeScene";
import Move from "./Move";


class TowerSorter extends Component {

    previousDisk = -1;

    towerArray = [];

    moveHistory = [];

    moveCount = 0;

    maxMoves = 0;

    constructor(props) {
        super(props);

        let discArray = [];

        let discCount = 12;

        for (let j = discCount; j > 0; j--) {
            discArray.push(j);
        }

        this.maxMoves = Math.pow(2, (discArray[0]));

        let solution = discArray.join('');

        this.towerArray.push(new Tower(true, solution, 1, discArray));
        this.towerArray.push(new Tower(false, solution, 2));
        this.towerArray.push(new Tower(false, solution, 3));

        this.state = {
            discCount: discCount,
            towerArray: [],
            moveHistory: [],
            solved: false,
            initialTowerState: TowerSorter.cloneTowerArray(this.towerArray),
        };

        this.toggleMoveListPanel = this.toggleMoveListPanel.bind(this);

    }

    static cloneTowerArray(towerArray) {
        let clonedTowerArray = [];
        for (let i = 0; i < towerArray.length; i++) {
            clonedTowerArray.push(Tower.createFrom(towerArray[i]));
        }

        return clonedTowerArray;
    }


    outputTowerStates() {

        let towerArray = Array.from(this.towerArray);

        let towerStates = [];

        for (let i = 0; i < towerArray.length; i++) {

            if (towerArray[i]) {
                console.log(towerArray[i].getDesc());
                towerStates.push(towerArray[i].getDesc());
            }

        }

        return towerStates;

    }


    static testSolved(towerArray) {

        let solved = false;
        for (let i = 0; i < towerArray.length; i++) {

            if (towerArray[i].getIsSolved()) {
                solved = true;
                break;
            }
        }

        return solved;
    }

    performMove(towerArray) {

        let moved = false;

        for (let i = 0; i < towerArray.length; i++) {
            let tower = towerArray[i];

            let disc = tower.getTopDisc();

            if (disc && (disc !== this.previousDisk)) {

                moved = this.findTargetTower(i + 1, towerArray, disc, tower, moved);

                if (moved) {
                    return moved;
                } else {
                    //Wrap around
                    moved = this.findTargetTower(0, towerArray, disc, tower, moved);
                }
            }
        }
        return moved;
    }

    findTargetTower(i, towerArray, disc, sourceTower) {

        let moved = false;

        for (let k = i; k < towerArray.length; k++) {

            let targetTower = towerArray[k];

            let unchangedSourceTower = Tower.createFrom(sourceTower);

            let unchangedTargetTower = Tower.createFrom(targetTower);

            let success = targetTower.addDisc(disc);

            if (success) {

                //Key logic
                this.moveCount++;
                this.previousDisk = disc;
                sourceTower.removeTopDisc();
                moved = true;

                //Logging and tracking logic.
                console.log("Move count: " + this.moveCount + " - Moved disc " + disc + " from tower: "
                    + sourceTower.getTowerNumber() + " to tower: " + targetTower.getTowerNumber()
                );

                let move = new Move(this.moveCount, disc, unchangedSourceTower, unchangedTargetTower,
                    targetTower.getTowerNumber(),
                    TowerSorter.cloneTowerArray(this.towerArray));

                this.moveHistory.push(move);

                break;
            }

        }
        return moved;
    }

    outputMoveHistory() {
        console.log("move history length: " + this.moveHistory.length);
        for (let i = 0; i < this.moveHistory.length; i++) {
            console.log(this.moveHistory[i].move);
        }
    }


    componentDidMount() {

        this.solvePuzzle();
    }

    solvePuzzle() {
        let towerArray = this.towerArray;

        console.log('Starting tower state');
        console.log('--------------------');
        console.log(this.outputTowerStates());
        console.log('--------------------');

        let solved = false;
        let iterationCount = 1;

        while (!solved && iterationCount <= this.maxMoves) {

            this.performMove(this.towerArray);

            solved = TowerSorter.testSolved(towerArray);

            iterationCount++;

            if (solved) {
                console.log("Puzzle solved in " + iterationCount + " iterations");
                console.log("Puzzle solved in moves: " + this.moveCount);
            }

        }

        console.log('Ending tower state');
        console.log('--------------------');
        console.log(this.outputTowerStates());
        console.log('--------------------');

        this.setState({
            towerArray: this.towerArray,
            moveHistory: this.moveHistory,
            solved: solved,
            moveCount: this.moveCount,
        });

        // this.outputMoveHistory();
    }

    toggleMoveListPanel() {
        this.setState({
            displayMoveList: !this.state.displayMoveList
        })
    }

    render() {

        let puzzleBanner = '';
        if (this.state.solved) {
            puzzleBanner = <div className="puzzleBanner">Puzzle Solved in {this.state.moveCount} moves.</div>;
        }

        return (
            <div>
                {this.state.solved &&
                <ThreeScene moveHistory={this.state.moveHistory} discCount={this.state.discCount}/>}
                <div>Initial Tower State</div>
                <table className="centeredTable">
                    <tbody>
                    <tr>
                        <th>Tower #
                        </th>
                        <th>Disc Order</th>
                    </tr>
                    {this.state.initialTowerState.map((item) => {
                        return (
                            <tr key={item.getTowerNumber()}>
                                <td>{item.getTowerNumber()}</td>
                                <td>{item.getDiscOrder()}</td>
                            </tr>
                        );
                    })}

                    </tbody>
                </table>

                <div>Solved Tower State</div>
                <table className="centeredTable">
                    <tbody>
                    <tr>
                        <th>Tower #
                        </th>
                        <th>Disc Order</th>
                    </tr>

                    {this.state.towerArray.map((item) => {
                        return (
                            <tr key={item.getTowerNumber()}>
                                <td>{item.getTowerNumber()}</td>
                                <td>{item.getDiscOrder()}</td>
                            </tr>
                        );
                    })}

                    </tbody>
                </table>

                {puzzleBanner}

                <button onClick={this.toggleMoveListPanel}> Display Move List</button>

                {this.state.displayMoveList && <MoveList moveHistory={this.state.moveHistory}/>}
            </div>
        );
    }

}


export default TowerSorter;