import React, {Component} from 'react';

class MoveList extends Component {


    render() {

        return (
            <table className="centeredLgTable">
                <tbody>
                <tr>
                    <th>Move Count
                    </th>
                    <th>Move Detail</th>
                    <th>Tower State</th>
                </tr>
                {this.props.moveHistory.map((item) => {
                        return (
                            <tr key={item.moveCount}>
                                <td> {item.moveCount} </td>
                                <td> {item.moveDesc} </td>
                                <td>
                                    <table>
                                        <tbody>

                                        {
                                            item.endingTowerStates.map((towerState) => {
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
            </table>);
    }

}

export default MoveList;