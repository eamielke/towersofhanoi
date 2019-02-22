import React, {Component} from 'react';
import Tower from "./Tower";
import MoveList from "./MoveList";
import ThreeScene from "./ThreeScene";
import Move from "./Move";
import {Label, Form} from 'semantic-ui-react';
import {Divider} from 'semantic-ui-react';
import {Select} from 'semantic-ui-react';
import {Header} from 'semantic-ui-react'
import {Segment} from 'semantic-ui-react';
import {Container} from 'semantic-ui-react';
import {Table} from 'semantic-ui-react';
import {Responsive, Message, Button} from "semantic-ui-react";


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
            initialTowerState: []
        };
        this.toggleMoveListPanel = this.toggleMoveListPanel.bind(this);
        this.handleDiscSelect = this.handleDiscSelect.bind(this);

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

    render() {

        let puzzleBanner = '';
        if (this.state.solved) {

            puzzleBanner = <Container>
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
                </Responsive>

            </Container>;
        }

        let discOptions = [
            {key: '0', value: '0'},
            {key: '3', value: '3', text: '3 discs'},
            {key: '4', value: '4', text: '4 discs'},
            {key: '5', value: '5', text: '5 discs'},
            {key: '6', value: '6', text: '6 discs'},
            {key: '7', value: '7', text: '7 discs'},
            {key: '8', value: '8', text: '8 discs'},
            {key: '9', value: '9', text: '9 discs'},
            {key: '10', value: '10', text: '10 discs'},
            {key: '11', value: '11', text: '11 discs'},
            {key: '12', value: '12', text: '12 discs'}
        ];

        return (


            <Container>


                <Header as='h1'>Towers of Hanoi Demo</Header>

                {this.state.solved &&
                <ThreeScene key={this.state.discCount} moveHistory={this.state.moveHistory}
                            discCount={this.state.discCount}/>}

                <Form>
                    <Form.Field inline>
                        <Responsive {...Responsive.onlyComputer} as={Label} size='small' position='right'>
                            Select the number of discs to initiate the solution:
                        </Responsive>
                        <Responsive {...Responsive.onlyTablet} >
                            <Label size='large' pointing="below">
                                Select the number of discs to initiate the solution:
                            </Label>
                        </Responsive>
                        <Responsive {...Responsive.onlyMobile}>
                            <Label size='huge' pointing="below">
                                Select the number of discs to initiate the solution:
                            </Label>
                        </Responsive>
                        <Select id="discSelector" options={discOptions}
                                onChange={this.handleDiscSelect}>

                        </Select>
                    </Form.Field>
                </Form>

                <Divider/>

                {puzzleBanner}

                {this.state.displayMoveList && <MoveList key={this.state.discCount + 'MoveList'} moveHistory={this.state.moveHistory}/>}

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
                </Segment.Group>

            </Container>
        );
    }

}


export default TowerSorter;