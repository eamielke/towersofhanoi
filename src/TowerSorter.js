import React, {Component} from 'react';
import Tower from "./Tower";
import MoveList from "./MoveList";
import ThreeScene from "./ThreeScene";
import Move from "./Move";
import {Dropdown, Header, Sticky} from 'semantic-ui-react'
import {Segment, Icon} from 'semantic-ui-react';
import {Table} from 'semantic-ui-react';
import {Responsive, Message, Button, Grid, Menu, Sidebar} from "semantic-ui-react";
import DiscSelect from "./DiscSelect";
import scrollIntoView from 'scroll-into-view-if-needed'

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
            ThreeJS: true,
            paused: false
        };
        this.toggleMoveListPanel = this.toggleMoveListPanel.bind(this);
        this.handleDiscSelect = this.handleDiscSelect.bind(this);
        this.reset = this.reset.bind(this);
        this.handleSideBarShowClick = this.handleSideBarShowClick.bind(this);
        this.handleSidebarHide = this.handleSidebarHide.bind(this);
        this.toggleAnimation = this.toggleAnimation.bind(this);
        this.getCurrentMoveNumber = this.toggleAnimation.bind(this);
        this.isPaused = this.isPaused.bind(this);
        this.scrollToMoveListRef = this.scrollToMoveListRef.bind(this);
        this.updateCurrentMove = this.updateCurrentMove.bind(this);
        this.isAnimationComplete = this.isAnimationComplete.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);

        this.threeRef = React.createRef();

        this.moveListRef = React.createRef();

        this.scrolltoMoveList = false;
        this.displayMoveList = false;

        this.discOptions = [
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
            visible: false,
            paused: false
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


    handleDiscSelect(event, data) {
        if (data.value > 0) {

            this.setupTowers(data.value);
            this.solvePuzzle();
        }
    }

    handleSideBarShowClick() {
        this.setState({visible: true});
    }

    handleSidebarHide() {
        console.log('Hiding sidebar: ' + this.state.visible);
        this.setState({visible: false});
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

        let buttonLabel = this.state.displayMoveList ? 'Hide Move List' : 'Display Move List';

        return (<Grid.Column>
            <Responsive {...Responsive.onlyComputer} >
                <Message positive size={'small'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle Solved in {this.state.moveCount} moves.</p>
                    <Button primary onClick={this.toggleMoveListPanel}>{buttonLabel}</Button>
                </Message>
            </Responsive>
            <Responsive {...Responsive.onlyTablet} >
                <Message positive size={'huge'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle Solved in {this.state.moveCount} moves.</p>
                    <Button primary onClick={this.toggleMoveListPanel}>{buttonLabel}</Button>
                </Message>
            </Responsive>
            <Responsive {...Responsive.onlyMobile} >
                <Message positive size={'large'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle Solved in {this.state.moveCount} moves.</p>
                    <Button primary onClick={this.toggleMoveListPanel}>{buttonLabel}</Button>
                </Message>
            </Responsive></Grid.Column>);
    }


    reset() {

        this.setState({ThreeJS: !this.state.ThreeJS, paused: false});

        this.handleSidebarHide();

    }

    getCurrentMoveNumber() {
        return this.threeRef.current.getCurrentMove().moveCount;
    }

    isPaused() {
        if (this.threeRef && this.threeRef.current) {
            return this.threeRef.current.isPaused();
        } else {
            return false;
        }

    }

    toggleAnimation() {

        this.threeRef.current.toggleAnimation();

        this.setState({paused: !this.state.paused});

        this.handleSidebarHide();
    }


    toggleMoveListPanel() {

        this.setState({
            displayMoveList: !this.state.displayMoveList
        });

        this.displayMoveList = !this.displayMoveList;
        this.scrolltoMoveList = this.displayMoveList;

        console.log('Setting scrollToMoveList: ' + this.scrolltoMoveList);

        this.handleSidebarHide();
    }

    scrollToMoveListRef() {
        const node = document.getElementById('moveList');

        console.log('before scrollToMoveList: ' + this.scrolltoMoveList);

        if (node && this.scrolltoMoveList) {
            scrollIntoView(node, {
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest',
                behavior: 'smooth',
            });
        }

        this.scrolltoMoveList = false;
        console.log('after scrollToMoveList: ' + this.scrolltoMoveList);
    }

    isAnimationComplete() {
        if (this.threeRef && this.threeRef.current) {
            return this.threeRef.current.isAnimationComplete();
        } else {
            return false;
        }

    }

    updateCurrentMove(currentMove) {
        this.setState({currentMove: currentMove});
    }

    updateDimensions() {
        console.log('Updating state in parent component');
        this.setState({width: window.innerWidth, height: window.innerHeight, paused: this.isPaused()});
    }

    render() {

        let pauseMenu = <Menu.Item disabled={!this.threeRef.current
        || this.isAnimationComplete()}
                                   color='green' active={this.state.paused}
                                   onClick={this.toggleAnimation}><span>{this.state.paused ?
            'Resume' : 'Pause'}</span></Menu.Item>;

        let pauseMenuMobile = <Menu.Item position='right' disabled={!this.threeRef.current
        || this.isAnimationComplete()}
                                         color='green' active={this.state.paused}
                                         onClick={this.toggleAnimation}><Icon size={'big'} name={this.state.paused ?
            'play' : 'pause'}/></Menu.Item>;


        return (
            <div>
                <Responsive {...Responsive.onlyMobile}>
                    <Sticky>
                        <Menu borderless size='small' icon>

                            <Menu.Item
                                onClick={this.handleSideBarShowClick}>
                                <Icon size={'big'} name={'bars'}/>
                            </Menu.Item>
                            <Menu.Item header as={'h3'}>
                                Towers of Hanoi Demo
                            </Menu.Item>
                            <Menu.Menu position='right'>
                                {pauseMenuMobile}
                                <Menu.Item position='right' disabled={!this.threeRef.current} as={'a'}
                                           onClick={this.reset}><Icon size='big' name={'recycle'}/></Menu.Item>
                            </Menu.Menu>
                        </Menu>
                    </Sticky>
                </Responsive>
                <Sidebar.Pushable>
                    <Responsive {...Responsive.onlyMobile}>
                        <Sidebar
                            as={Menu}
                            inverted
                            animation='overlay'
                            icon='labeled'
                            onHide={this.handleSidebarHide}
                            vertical
                            visible={this.state.visible}
                            width={'wide'}>
                            <Menu.Item> <Dropdown fluid options={this.discOptions} selection
                                                  placeholder={'Select a disc to start'}
                                                  onChange={this.handleDiscSelect}>

                            </Dropdown></Menu.Item>
                            {pauseMenu}
                            <Menu.Item disabled={!this.threeRef.current} as={'a'} onClick={this.reset}>Reset</Menu.Item>
                            <Menu.Item disabled={!this.threeRef.current} as={'a'} onClick={this.toggleMoveListPanel}>
                                {this.state.displayMoveList ? 'Hide Move List' : 'Display Move List'}</Menu.Item>
                        </Sidebar>
                    </Responsive>

                    <Sidebar.Pusher className='mainPanel'>

                        <Segment basic>

                            <Grid columns={1} textAlign='center' padded>

                                <Responsive {...Responsive.onlyComputer} >
                                    <Grid.Column width={16}>
                                        <Header textAlign='center' as='h1'>Towers of Hanoi Demo</Header>
                                    </Grid.Column>
                                </Responsive>
                                <Responsive {...Responsive.onlyTablet} >
                                    <Grid.Column width={16}>
                                        <Header textAlign='center' as='h1'>Towers of Hanoi Demo</Header>
                                    </Grid.Column>
                                </Responsive>

                                <Grid.Column width={16}>
                                    {this.state.solved &&
                                    <ThreeScene ref={this.threeRef}
                                                key={this.state.discCount + this.state.ThreeJS}
                                                moveHistory={this.state.moveHistory}
                                                discCount={this.state.discCount} resetButton={this.reset}
                                                toggleMoveListPanel={this.toggleMoveListPanel}
                                                handleDiscSelect={this.handleDiscSelect}
                                                updateCurrentMove={this.updateCurrentMove}
                                                updateDimensions={this.updateDimensions}
                                    />}
                                </Grid.Column>

                                <Grid.Column width={16}>
                                    <DiscSelect discSelectKey="discSelect" handleDiscSelect={this.handleDiscSelect}/>
                                </Grid.Column>

                                {this.state.solved && this.getPuzzleBanner()}

                                {this.state.displayMoveList &&<Grid.Column>

                                    <MoveList id='moveList' ref={this.moveListRef}
                                              scrollToMoveListRef={this.scrollToMoveListRef}
                                              key={this.state.discCount + 'MoveList'}
                                              moveHistory={this.state.moveHistory}/>
                                </Grid.Column>}

                                <Grid.Column>
                                    {this.state.solved && this.getTowerStateSegment()}
                                </Grid.Column>
                            </Grid>
                        </Segment>
                    </Sidebar.Pusher>

                </Sidebar.Pushable>
            </div>

        );
    }

}


export default TowerSorter;