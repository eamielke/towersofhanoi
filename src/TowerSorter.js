import React, {Component} from 'react';
import Tower from "./Tower";
import MoveList from "./MoveList";
import TowerRenderer from "./TowerRenderer";
import {Header, Progress, Sticky} from 'semantic-ui-react'
import {Segment, Icon} from 'semantic-ui-react';
import {Table} from 'semantic-ui-react';
import {Responsive, Message, Button, Grid, Menu, Sidebar} from "semantic-ui-react";
import DiscSelect from "./DiscSelect";
import scrollIntoView from 'scroll-into-view-if-needed';
import worker_script from './SolverWorker';


const MoveListButton = ({moveHistory, displayMoveList, toggleMoveListPanel}) => {

    let buttonLabel = displayMoveList ? 'Hide Move List' : 'Display Move List';

    if (moveHistory && moveHistory.length > 0) {
        return <Button primary onClick={toggleMoveListPanel}>{buttonLabel}</Button>;

    } else {
        return null;
    }
};

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
            TowerThreeJS: true,
            paused: false,
            progress: 0,
            solveInProgress: false,
        };

        this.discCount = 0;

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
        this.handleSolverWorkerMessage = this.handleSolverWorkerMessage.bind(this);

        this.TowerRendererRef = React.createRef();

        this.moveListRef = React.createRef();

        this.scrolltoMoveList = false;
        this.displayMoveList = false;

        this.solverWorker = new Worker(worker_script);

        this.solverWorker.onmessage = this.handleSolverWorkerMessage;

    }

    convertToTowerArray(towerDataArray) {
        let towerArray = [];

        for (let i = 0; i < towerDataArray.length; i++) {
            towerArray.push(this.convertToTower(towerDataArray[i]));
        }
        return towerArray;
    }

    convertToTower(towerData) {
        return new Tower(towerData.initial, towerData.solution,
            towerData.towerNumber, towerData.discs);
    }


    handleSolverWorkerMessage(e) {

        let data = e.data.data;

        if (data.solved) {

            let towerArray = this.convertToTowerArray(data.towerArray);

            this.setState({
                towerArray: towerArray,
                solved: data.solved,
                moveCount: data.moveCount,
                moveHistory: this.moveHistory,
            });

            this.towerArray = towerArray;

            this.solverWorker.terminate();

            this.solverWorker = new Worker(worker_script);

            this.solverWorker.onmessage = this.handleSolverWorkerMessage;

            this.setState({solveInProgress: false});

            //console.log('Ending tower state');
            //console.log('--------------------');
            //console.log(this.outputTowerStates());
            //console.log('--------------------');
        } else {

            this.moveHistory = [...this.moveHistory, ...data.moveHistory];
            this.setState({progress: data.progress, solved: false});
        }

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
        this.discCount = discCount;

        this.setState({
            discCount: discCount,
            towerArray: [],
            moveHistory: [],
            solved: false,
            initialTowerState: this.towerArray,
            visible: false,
            paused: false,
            progress: 0
        });
    }


    outputTowerStates() {

        let towerStates = [];

        for (let i = 0; i < this.towerArray.length; i++) {

            if (this.towerArray[i]) {
                //console.log(this.towerArray[i].getDesc());
                towerStates.push(this.towerArray[i].getDesc());
            }

        }

        return towerStates;

    }


    handleDiscSelect(event, data) {
        if (data.value > 0) {
            this.setState({progress: 0});
            this.discCount = data.value;
            this.setupTowers(data.value);
            this.solvePuzzle();
        }
    }

    handleSideBarShowClick() {
        this.setState({visible: true});
    }

    handleSidebarHide() {
        //console.log('Hiding sidebar: ' + this.state.visible);
        this.setState({visible: false});
    }

    solvePuzzle() {

        //console.log('Starting web worker');
        this.setState({solveInProgress: true});
        this.solverWorker.postMessage({event: 'Solve', data: this.discCount});

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
                    <MoveListButton
                        moveHistory={this.state.moveHistory} displayMoveList={this.state.displayMoveList}
                        toggleMoveListPanel={this.toggleMoveListPanel}/>
                </Message>
            </Responsive>
            <Responsive {...Responsive.onlyTablet} >
                <Message positive size={'huge'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle Solved in {this.state.moveCount} moves.</p>
                    <MoveListButton
                        moveHistory={this.state.moveHistory} displayMoveList={this.state.displayMoveList}
                        toggleMoveListPanel={this.toggleMoveListPanel}/>
                </Message>
            </Responsive>
            <Responsive {...Responsive.onlyMobile} >
                <Message positive size={'large'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle Solved in {this.state.moveCount} moves.</p>
                    <MoveListButton
                        moveHistory={this.state.moveHistory} displayMoveList={this.state.displayMoveList}
                        toggleMoveListPanel={this.toggleMoveListPanel}/>
                </Message>
            </Responsive></Grid.Column>);
    }


    reset() {

        this.setState({TowerThreeJS: !this.state.TowerThreeJS, paused: false});

        this.handleSidebarHide();

    }

    getCurrentMoveNumber() {
        return this.TowerRendererRef.current.getCurrentMove().moveCount;
    }

    isPaused() {
        if (this.TowerRendererRef && this.TowerRendererRef.current) {
            return this.TowerRendererRef.current.isPaused();
        } else {
            return false;
        }

    }

    toggleAnimation() {

        this.TowerRendererRef.current.toggleAnimation();

        this.setState({paused: !this.state.paused});

        this.handleSidebarHide();
    }


    toggleMoveListPanel() {

        this.setState({
            displayMoveList: !this.state.displayMoveList
        });

        this.displayMoveList = !this.displayMoveList;
        this.scrolltoMoveList = this.displayMoveList;

        //console.log('Setting scrollToMoveList: ' + this.scrolltoMoveList);

        this.handleSidebarHide();
    }

    scrollToMoveListRef() {
        const node = document.getElementById('moveList');

        //console.log('before scrollToMoveList: ' + this.scrolltoMoveList);

        if (node && this.scrolltoMoveList) {
            scrollIntoView(node, {
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest',
                behavior: 'smooth',
            });
        }

        this.scrolltoMoveList = false;
        //console.log('after scrollToMoveList: ' + this.scrolltoMoveList);
    }

    isAnimationComplete() {
        if (this.TowerRendererRef && this.TowerRendererRef.current) {
            return this.TowerRendererRef.current.isAnimationComplete();
        } else {
            return false;
        }

    }

    updateCurrentMove(currentMove) {
        this.setState({currentMove: currentMove});
    }

    updateDimensions() {
        //console.log('Updating state in parent component');
        this.setState({width: window.innerWidth, height: window.innerHeight, paused: this.isPaused()});
    }

    render() {

        let pauseMenu = <Menu.Item disabled={!this.TowerRendererRef.current
        || this.isAnimationComplete()}
                                   color='green' active={this.state.paused}
                                   onClick={this.toggleAnimation}><span>{this.state.paused ?
            'Resume' : 'Pause'}</span></Menu.Item>;

        let pauseMenuMobile = <Menu.Item position='right' disabled={!this.TowerRendererRef.current
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
                                <Menu.Item position='right' disabled={!this.TowerRendererRef.current} as={'a'}
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
                            <Menu.Item>
                                {this.state.solveInProgress === false &&
                                <DiscSelect key={this.state.discCount}
                                            subKey={this.state.discCount}
                                            complex={false} fluid
                                            placeholder={'Select a disc to start'}
                                            handleDiscSelect={this.handleDiscSelect}/>}
                            </Menu.Item>
                            {pauseMenu}
                            <Menu.Item disabled={!this.TowerRendererRef.current} as={'a'}
                                       onClick={this.reset}>Reset</Menu.Item>
                            <Menu.Item disabled={!this.TowerRendererRef.current} as={'a'}
                                       onClick={this.toggleMoveListPanel}>
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

                                {this.state.solved === false && this.state.discCount > 0 &&
                                <Grid.Column width={16}>
                                    <Progress key={this.state.discCount} percent={this.state.progress} color='blue'>
                                        Solving Towers of Hanoi Puzzle for {this.state.discCount} discs
                                    </Progress>
                                </Grid.Column>}

                                <Grid.Column width={16}>
                                    {this.state.solved && this.state.moveHistory &&
                                    this.state.moveHistory.length > 0 &&
                                    <TowerRenderer ref={this.TowerRendererRef}
                                                   key={this.state.discCount + this.state.TowerThreeJS}
                                                   subKey={this.state.discCount + this.state.TowerThreeJS}
                                                   moveHistory={this.state.moveHistory}
                                                   discCount={this.state.discCount} resetButton={this.reset}
                                                   toggleMoveListPanel={this.toggleMoveListPanel}
                                                   handleDiscSelect={this.handleDiscSelect}
                                                   updateCurrentMove={this.updateCurrentMove}
                                                   updateDimensions={this.updateDimensions}
                                    />}
                                </Grid.Column>


                                <Grid.Column width={16}>
                                    {this.state.solveInProgress === false &&
                                    <DiscSelect discSelectKey="discSelect" handleDiscSelect={this.handleDiscSelect}/>}
                                </Grid.Column>

                                {this.state.solved && this.getPuzzleBanner()}

                                {this.state.displayMoveList && this.state.moveHistory
                                && this.state.moveHistory.length > 0
                                && <Grid.Column>

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