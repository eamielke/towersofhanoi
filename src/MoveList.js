import React, {Component} from 'react';
import {Table} from 'semantic-ui-react';

class MoveList extends Component {


    render() {

        return (
            <Table celled unstackable>

                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Move #
                        </Table.HeaderCell>
                        <Table.HeaderCell>Move Detail</Table.HeaderCell>
                        <Table.HeaderCell>Tower State</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {this.props.moveHistory.map((item) => {
                            return (
                                <Table.Row key={item.moveCount}>
                                    <Table.Cell> {item.moveCount} </Table.Cell>
                                    <Table.Cell> {item.moveDesc} </Table.Cell>
                                    <Table.Cell>

                                        <Table unstackable>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>Tower #</Table.HeaderCell>
                                                    <Table.HeaderCell>Disc Order</Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>

                                                {
                                                    item.endingTowerStates.map((towerState) => {
                                                            return (<Table.Row key={towerState.getTowerNumber()}>
                                                                <Table.Cell>{towerState.getTowerNumber()}</Table.Cell>
                                                                <Table.Cell>{towerState.getDiscOrder()}</Table.Cell>
                                                            </Table.Row>);
                                                        }
                                                    )
                                                }

                                            </Table.Body>
                                        </Table>
                                    </Table.Cell>
                                </Table.Row>
                            );

                        }
                    )}

                </Table.Body>
            </Table>);
    }

}

export default MoveList;