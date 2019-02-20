import React, {Component} from 'react';
import Tower from "./Tower";


class TowerSorter extends Component {

    previousDisk = -1;

    towerArray = [];

    moveHistory = [];

    moveCount = 0;

    maxMoves = 0;


    constructor(props) {
        super(props);

        let discArray = [];

        let numberOfDiscs = 7;

        for (let j = numberOfDiscs; j > 0; j--) {
            discArray.push(j);
        }

        this.maxMoves = Math.pow(2, (discArray[0]));

        let solution = discArray.join('');

        this.towerArray.push(new Tower(true, solution, 1, discArray));
        this.towerArray.push(new Tower(false, solution, 2));
        this.towerArray.push(new Tower(false, solution, 3));

        this.state = {
            towerArray: [],
            moveHistory: [],
            initialTowerState: this.cloneTowerArray(this.towerArray),
        }

    }

    cloneTowerArray(towerArray) {
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

            let success = targetTower.addDisc(disc);

            if (success) {

                //Key logic
                this.moveCount++;
                this.previousDisk = disc;
                sourceTower.removeTopDisc();
                moved = true;

                //Logging and tracking logic.
                console.log("True move count: " + this.moveCount + " - Moved disc " + disc + " from tower: "
                    + sourceTower.getTowerNumber() + " to tower: " + targetTower.getTowerNumber()
                );
                this.outputTowerStates();
                let moveDetail = {
                    moveCount: this.moveCount,
                    move: "Moved disc " + disc + " from tower: " + sourceTower.getTowerNumber() + " to tower: "
                        + targetTower.getTowerNumber(),
                    towerStates: this.cloneTowerArray(this.towerArray),
                };
                this.moveHistory.push(moveDetail);


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

        this.outputMoveHistory();
    }


    render() {

        let puzzleBanner = '';
        if (this.state.solved) {
            puzzleBanner = <div>Puzzle Solved in {this.state.moveCount} moves.</div>;
        }

        return (
            <div>

                <div>Initial State</div>
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

                <table className="centeredLgTable">
                    <tbody>
                    <tr>
                        <th>Move Count
                        </th>
                        <th>Move Detail</th>
                        <th>Tower State</th>
                    </tr>
                    {this.state.moveHistory.map((item) => {
                            return (
                                <tr key={item.moveCount}>
                                    <td> {item.moveCount} </td>
                                    <td> {item.move} </td>
                                    <td>
                                        <table>
                                            <tbody>

                                            {
                                                item.towerStates.map((towerState, i) => {
                                                        return (<tr key={towerState.getTowerNumber()}>
                                                            <td>{towerState.getTowerNumber()}</td>
                                                            <td>{towerState.getDiscOrder()}</td>
                                                        </tr>);
                                                    }
                                                )
                                            }

                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            );

                        }
                    )}

                    </tbody>
                </table>
            </div>
        );
    }

}


export default TowerSorter;