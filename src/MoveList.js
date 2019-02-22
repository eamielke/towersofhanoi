import React, {Component} from 'react';
import {Icon, Menu, Table} from 'semantic-ui-react';

class MoveList extends Component {

    pageSize = 10;
    moveHistoryPages = [];
    moveHistoryPagesSubset = [];
    currentPage = 0;
    totalPages = 0;

    constructor(props) {
        super(props);

        let tempArray = Array.from(this.props.moveHistory);

        this.totalPages = Math.floor(tempArray.length / this.pageSize);

        if (this.totalPages > 0) {
            for (let i = 0; i < this.totalPages; i++) {
                this.moveHistoryPages.push(tempArray.splice(i, this.pageSize));
            }

            this.moveHistoryPagesSubset = Array.from(this.moveHistoryPages).splice(0, 6);
        } else {
            this.moveHistoryPages.push(tempArray);
            this.moveHistoryPagesSubset = Array.from(tempArray);
        }

        this.currentPage = 0;

        this.state = {
            currentPageData: this.moveHistoryPages[0],
        };

        this.navLeft = this.navLeft.bind(this);
        this.navRight = this.navRight.bind(this);
    }

    navToPage(page) {
        //Normalize page number

        let normalizedPage = page.i;


        return () => {
            if (normalizedPage < 1) {
                normalizedPage = 0;
            }
            this.currentPage = normalizedPage;
            this.setState({
                currentPageData: this.moveHistoryPages[normalizedPage],
            });
        }
    }

    navLeft() {
        this.currentPage--;
        if (this.currentPage < 0) {
            this.currentPage = 0;
        }
        this.setState({
            currentPageData: this.moveHistoryPages[this.currentPage]
        });
    }

    navRight() {
        this.currentPage++;

        if (this.totalPages > 0 && this.currentPage > (this.totalPages - 1)) {

            this.currentPage = this.totalPages - 1;

        }
        this.setState({
            currentPageData: this.moveHistoryPages[this.currentPage]
        });


    }


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
                    {this.state.currentPageData.map((item) => {
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
                <Table.Footer>
                    <Table.Row>
                        <Table.HeaderCell colSpan='3'>
                            <Menu floated='right' pagination>
                                {this.totalPages > 0 && <Menu.Item key='navleft' as='a' icon onClick={this.navLeft}>
                                    <Icon name='chevron left'/>
                                </Menu.Item>}
                                {this.totalPages > 0 && this.moveHistoryPagesSubset.map((item, i) => {
                                        return (
                                            <Menu.Item key={i} as='a' onClick={this.navToPage({i})}>{i + 1}</Menu.Item>
                                        )
                                    }
                                )}
                                {this.totalPages > 0 &&
                                <Menu.Item  key='navright' as='a' icon>
                                    <Icon name='chevron right' onClick={this.navRight}/>
                                </Menu.Item>
                                }
                            </Menu>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>);
    }

}

export default MoveList;