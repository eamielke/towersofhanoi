import React, {Component} from 'react';
import {Button, Header, Responsive, Segment, Grid, Table, Message, Menu, Icon} from "semantic-ui-react";

export const PauseMenu = ({towerRenderRef, isAnimationComplete, toggleAnimation, paused}) => {
    return (<Menu.Item disabled={!towerRenderRef
    || isAnimationComplete()}
                       color='green' active={paused}
                       onClick={toggleAnimation}><span>{paused ?
        'Resume' : 'Pause'}</span></Menu.Item>);
};


export const PauseMenuMobile = ({towerRenderRef, isAnimationComplete, toggleAnimation, paused}) => {
    return (<Menu.Item position='right' disabled={!towerRenderRef
    || isAnimationComplete()}
                       color='green' active={paused}
                       onClick={toggleAnimation}><Icon size={'big'} name={this.state.paused ?
        'play' : 'pause'}/></Menu.Item>);
};



export const MoveListButton = ({moveHistory, displayMoveList, toggleMoveListPanel}) => {

    let buttonLabel = displayMoveList ? 'Hide Move List' : 'Display Move List';

    if (moveHistory && moveHistory.length > 0) {
        return <Button primary onClick={toggleMoveListPanel}>{buttonLabel}</Button>;

    } else {
        return null;
    }
};

export const PuzzleBanner = ({solved, moveHistory, displayMoveList, toggleMoveListPanel, discCount, moveCount}) => {

    if (solved) {
        return (<Grid.Column>
            <Responsive {...Responsive.onlyComputer} >
                <Message positive size={'small'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle with {discCount} discs was solved in {moveCount} moves.</p>
                    <MoveListButton
                        moveHistory={moveHistory} displayMoveList={displayMoveList}
                        toggleMoveListPanel={toggleMoveListPanel}/>
                </Message>
            </Responsive>
            <Responsive {...Responsive.onlyTablet} >
                <Message positive size={'huge'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle with {discCount} discs was solved in {moveCount} moves.</p>
                    <MoveListButton
                        moveHistory={moveHistory} displayMoveList={displayMoveList}
                        toggleMoveListPanel={toggleMoveListPanel}/>
                </Message>
            </Responsive>
            <Responsive {...Responsive.onlyMobile} >
                <Message positive size={'large'}>
                    <Message.Header>Success</Message.Header>
                    <p>Puzzle with {discCount} discs was solved in {moveCount} moves.</p>
                    <MoveListButton
                        moveHistory={moveHistory} displayMoveList={displayMoveList}
                        toggleMoveListPanel={toggleMoveListPanel}/>
                </Message>
            </Responsive></Grid.Column>)
    } else {
        return null;
    }

};

export const TowerStateSegment = ({as: Component = 'div', solved, initialTowerState, towerArray}) => {


    if (solved) {

        return (
            <Component>
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
                                {initialTowerState.map((item) => {
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
                                {towerArray.map((item) => {
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
            </Component>)
    } else {
        return null;
    }
};