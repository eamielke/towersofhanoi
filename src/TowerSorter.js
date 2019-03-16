// @flow
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

type State = {
    discCount: number,
    towerArray: Tower[],
    moveHistory: any[],
    solved: boolean,
    initialTowerState: Tower[],
    TowerThreeJS: boolean,
    paused: boolean,
    progress: number,
    solveInProgress: boolean,
    displayMoveList: boolean,
    visible: boolean,
    height: number,
    width: number,
    moveCount: number,
}


class TowerSorter extends Component<any, State> {


    _previousDisk: number = -1;

    _towerArray: Tower[] = [];

    _moveHistory: any[] = [];

    _moveCount: number = 0;

    _maxMoves: number = 0;

    _discCount: number = 0;

    solverWorker: Worker;

    TowerRendererRef: any;

    moveListRef: any;

    scrolltoMoveList: boolean;

    displayMoveList: boolean;


    constructor(props: any) {

        super(props);

        this._discCount = 0;

        (this: any).toggleMoveListPanel = this.toggleMoveListPanel.bind(this);
        (this: any).handleDiscSelect = this.handleDiscSelect.bind(this);
        (this: any).reset = this.reset.bind(this);
        (this: any).handleSideBarShowClick = this.handleSideBarShowClick.bind(this);
        (this: any).handleSidebarHide = this.handleSidebarHide.bind(this);
        (this: any).toggleAnimation = this.toggleAnimation.bind(this);
        (this: any).getCurrentMoveNumber = this.toggleAnimation.bind(this);
        (this: any).isPaused = this.isPaused.bind(this);
        (this: any).scrollToMoveListRef = this.scrollToMoveListRef.bind(this);
        (this: any).isAnimationComplete = this.isAnimationComplete.bind(this);
        (this: any).updateDimensions = this.updateDimensions.bind(this);
        (this: any).handleSolverWorkerMessage = this.handleSolverWorkerMessage.bind(this);

        this.TowerRendererRef = React.createRef();

        this.moveListRef = React.createRef();

        this.scrolltoMoveList = false;
        this.displayMoveList = false;

        this.solverWorker = new Worker(worker_script);

        this.solverWorker.onmessage = this.handleSolverWorkerMessage;

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
            displayMoveList: false,
            height: 0,
            width: 0,
            moveCount: 0,
            visible: false,

        };


    }

    convertToTowerArray(towerDataArray: any[]) {
        let towerArray = [];

        for (let i = 0; i < towerDataArray.length; i++) {
            towerArray.push(this.convertToTower(towerDataArray[i]));
        }
        return towerArray;
    }

    convertToTower(towerData: any) {
        return new Tower(towerData.initial, towerData.solution,
            towerData.towerNumber, towerData.discs);
    }


    handleSolverWorkerMessage(e: any) {

        // $FlowFixMe
        let data = e.data.data;

        if (data.solved) {

            let towerArray = this.convertToTowerArray(data.towerArray);

            this.setState({
                towerArray: towerArray,
                solved: data.solved,
                moveCount: data.moveCount,
                moveHistory: this._moveHistory,
            });

            this._towerArray = towerArray;

            this.solverWorker.terminate();

            this.solverWorker = new Worker(worker_script);

            this.solverWorker.onmessage = this.handleSolverWorkerMessage;

            this.setState({solveInProgress: false});

            //console.log('Ending tower state');
            //console.log('--------------------');
            //console.log(this.outputTowerStates());
            //console.log('--------------------');
        } else {

            this._moveHistory = [...this._moveHistory, ...data.moveHistory];
            this.setState({progress: data.progress, solved: false});
        }

    }

    setupTowers(discCount: number) {
        let discArray = [];

        for (let i = discCount; i > 0; i--) {
            discArray.push(i);
        }

        this._maxMoves = Math.pow(2, (discArray.length));

        this._previousDisk = -1;
        this._moveCount = 0;

        let solution = discArray.join('');

        this._towerArray.splice(0, this._towerArray.length);
        this._towerArray = [];
        this._moveHistory.splice(0, this._towerArray.length);
        this._moveHistory = [];

        this._towerArray.push(new Tower(true, solution, 1, discArray));
        this._towerArray.push(new Tower(false, solution, 2));
        this._towerArray.push(new Tower(false, solution, 3));
        this._discCount = discCount;

        this.setState({
            discCount: discCount,
            towerArray: [],
            moveHistory: [],
            solved: false,
            initialTowerState: this._towerArray,
            visible: false,
            paused: false,
            progress: 0
        });
    }

    handleDiscSelect(event: any, data: any) {
        if (data.value > 0) {
            this.setState({progress: 0});
            this._discCount = data.value;
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
        this.solverWorker.postMessage({event: 'Solve', data: this._discCount});

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
                    <p>Puzzle with {this.state.discCount} discs was solved in {this.state.moveCount} moves.</p>
                    <MoveListButton
                        moveHistory={this.state.moveHistory} displayMoveList={this.state.displayMoveList}
                        toggleMoveListPanel={this.toggleMoveListPanel}/>
                </Message>
            </Responsive>
            <Responsive {...Responsive.onlyTablet} >
                <Message positive size={'huge'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle with {this.state.discCount} discs was solved in {this.state.moveCount} moves.</p>
                    <MoveListButton
                        moveHistory={this.state.moveHistory} displayMoveList={this.state.displayMoveList}
                        toggleMoveListPanel={this.toggleMoveListPanel}/>
                </Message>
            </Responsive>
            <Responsive {...Responsive.onlyMobile} >
                <Message positive size={'large'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle with {this.state.discCount} discs was solved in {this.state.moveCount} moves.</p>
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
                                                   subKey={this.state.discCount + this.state.TowerThreeJS + ''}
                                                   moveHistory={this.state.moveHistory}
                                                   discCount={this.state.discCount} resetButton={this.reset}
                                                   toggleMoveListPanel={this.toggleMoveListPanel}
                                                   handleDiscSelect={this.handleDiscSelect}
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