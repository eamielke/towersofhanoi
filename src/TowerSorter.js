import React, {Component} from 'react';
import Tower from "./Tower";
import MoveList from "./MoveList";
import ThreeScene from "./ThreeScene";
import Move from "./Move";
import {Header} from 'semantic-ui-react'
import {Segment} from 'semantic-ui-react';
import {Container} from 'semantic-ui-react';
import {Table} from 'semantic-ui-react';
import {Responsive, Message, Button, Grid, Divider} from "semantic-ui-react";
import DiscSelect from "./DiscSelect";


class TowerSorter extends Component {

    previousDisk = -1;

    towerArray = [];

    moveHistory = [];

    moveCount = 0;

    maxMoves = 0;


    constructor(props) {
        super(props);
        this.state = {
            discCount: 0,
            towerArray: [],
            moveHistory: [],
            solved: false,
            initialTowerState: [],
            ThreeJS: true
        };
        this.toggleMoveListPanel = this.toggleMoveListPanel.bind(this);
        this.handleDiscSelect = this.handleDiscSelect.bind(this);
        this.reset = this.reset.bind(this);

    }

    setupTowers(discCount) {
        let discArray = [];

        for (let j = discCount; j > 0; j--) {
            discArray.push(j);
        }

        this.maxMoves = Math.pow(2, (discArray.length));

        this.previousDisk = -1;
        this.moveCount = 0;

        let solution = discArray.join('');

        this.towerArray.splice(0, this.towerArray.length);
        this.towerArray = [];
        this.moveHistory.splice(0, this.towerArray.length);
        this.moveHistory = [];

        this.towerArray.push(new Tower(true, solution, 1, discArray));
        this.towerArray.push(new Tower(false, solution, 2));
        this.towerArray.push(new Tower(false, solution, 3));

        this.setState({
            discCount: discCount,
            towerArray: [],
            moveHistory: this.moveHistory,
            solved: false,
            initialTowerState: TowerSorter.cloneTowerArray(this.towerArray),
        });
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


    handleDiscSelect(event, data) {
        if (data.value > 0) {

            this.setupTowers(data.value);
            this.solvePuzzle();
        }
    }

    solvePuzzle() {
        let towerArray = this.towerArray;

        console.log('Starting tower state');
        console.log('--------------------');
        console.log(this.outputTowerStates());
        console.log('--------------------');

        let solved = false;
        let iterationCount = 1;

        console.log('Prior to loop start - Solved: ' + solved + " iterationCount: " + iterationCount + " max moves: " + this.maxMoves);

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

    getTowerStateSegment() {

        return (
            <Segment.Group>
                <Segment>
                    <Header as="h4">Initial Tower State</Header>

                    <Table celled unstackable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Tower #
                                </Table.HeaderCell>
                                <Table.HeaderCell>Disc Order</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {this.state.initialTowerState.map((item) => {
                                return (
                                    <Table.Row key={item.getTowerNumber()}>
                                        <Table.Cell>{item.getTowerNumber()}</Table.Cell>
                                        <Table.Cell>{item.getDiscOrder()}</Table.Cell>
                                    </Table.Row>
                                );
                            })}

                        </Table.Body>
                    </Table>
                </Segment>

                <Segment>
                    <Header as="h4">Solved Tower State</Header>


                    <Table celled unstackable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Tower #
                                </Table.HeaderCell>
                                <Table.HeaderCell>Disc Order</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {this.state.towerArray.map((item) => {
                                return (
                                    <Table.Row key={item.getTowerNumber()}>
                                        <Table.Cell>{item.getTowerNumber()}</Table.Cell>
                                        <Table.Cell>{item.getDiscOrder()}</Table.Cell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table></Segment>
            </Segment.Group>);
    }

    getPuzzleBanner() {
        return (<Grid.Column>
            <Responsive {...Responsive.onlyComputer} >
                <Message positive size={'small'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle Solved in {this.state.moveCount} moves.</p>
                    <Button primary onClick={this.toggleMoveListPanel}> Display Move List</Button>
                </Message>
            </Responsive>
            <Responsive {...Responsive.onlyTablet} >
                <Message positive size={'huge'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle Solved in {this.state.moveCount} moves.</p>
                    <Button primary onClick={this.toggleMoveListPanel}> Display Move List</Button>
                </Message>
            </Responsive>
            <Responsive {...Responsive.onlyMobile} >
                <Message positive size={'large'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle Solved in {this.state.moveCount} moves.</p>
                    <Button primary onClick={this.toggleMoveListPanel}> Display Move List</Button>
                </Message>
            </Responsive></Grid.Column>);
    }


    reset() {

        this.setState({ThreeJS: !this.state.ThreeJS});
    }

    render() {


        return (


            <Container>

                <Grid columns={1}>
                    <Grid.Column>

                        <Grid columns={1}>

                            <Grid.Column>
                                <Responsive {...Responsive.onlyComputer} >
                                    <Header as='h1'>Towers of Hanoi Demo</Header>
                                </Responsive>
                                <Responsive {...Responsive.onlyTablet} >
                                    <Header as='h1'>Towers of Hanoi Demo</Header>
                                </Responsive>
                            </Grid.Column>

                            <Grid.Column>
                                {this.state.solved &&
                                <ThreeScene key={this.state.discCount + this.state.ThreeJS}
                                            moveHistory={this.state.moveHistory}
                                            discCount={this.state.discCount} resetButton={this.reset}
                                            toggleMoveListPanel={this.toggleMoveListPanel}
                                            handleDiscSelect={this.handleDiscSelect}/>}
                            </Grid.Column>

                            <Grid.Column>
                                <DiscSelect handleDiscSelect={this.handleDiscSelect}></DiscSelect>
                            </Grid.Column>
                        </Grid>

                    </Grid.Column>

                    {this.state.solved && this.getPuzzleBanner()}

                    <Grid.Column>
                        {this.state.displayMoveList &&
                        <MoveList key={this.state.discCount + 'MoveList'} moveHistory={this.state.moveHistory}/>}
                    </Grid.Column>

                    <Grid.Column>
                        {this.state.solved && this.getTowerStateSegment()}
                    </Grid.Column>
                </Grid>
            </Container>
        );
    }

}


export default TowerSorter;