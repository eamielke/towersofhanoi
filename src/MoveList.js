import React, {Component} from 'react';
import {Table, Grid, Pagination, Responsive} from 'semantic-ui-react';


class MoveList extends Component {

    moveHistoryPages = [];

    constructor(props) {
        super(props);

        let pageSize = 5;

        let tempArray = Array.from(this.props.moveHistory);

        let totalPages = Math.ceil(tempArray.length / pageSize);

        if (totalPages > 0) {
            for (let i = 0, t = tempArray.length; i < t; i += pageSize) {
                this.moveHistoryPages.push(tempArray.slice(i, i + pageSize));
            }

        } else {
            this.moveHistoryPages.push(tempArray);
        }

        this.handlePaginationChange = this.handlePaginationChange.bind(this);

        this.state = {
            currentPageData: this.moveHistoryPages[0],
            currentPage: 0,
            totalPages: totalPages,
            pageSize: pageSize,
            totalMoveCount: this.props.moveHistory.length,
        };

    }

    componentDidMount() {
        this.props.scrollToMoveListRef();
    }


    handlePaginationChange(e, {activePage}) {
        //Normalize page number

        let normalizedPage = activePage - 1;
        if (normalizedPage < 1) {
            normalizedPage = 0;
        }

        this.setState({
            currentPageData: this.moveHistoryPages[normalizedPage],
            currentPage: normalizedPage
        });

    }


    render() {

        return (

            <Grid id={this.props.id} columns={1}>
                <Grid.Column>
                    <Table key={this.state.totalMoveCount} celled unstackable>

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

                    </Table>
                </Grid.Column>
                <Grid.Column>
                    <Responsive {...Responsive.onlyComputer} >
                        <Pagination

                            onPageChange={this.handlePaginationChange}
                            defaultActivePage={1}
                            size='tiny'
                            boundaryRange={2}
                            siblingRange={2}
                            totalPages={this.state.totalPages}
                            // Heads up! All items are powered by shorthands, if you want to hide one of them, just pass `null` as value
                            ellipsisItem={'...'}
                        />

                    </Responsive>
                    <Responsive {...Responsive.onlyTablet} >
                        <Pagination compact


                                    onPageChange={this.handlePaginationChange}
                                    defaultActivePage={1}
                                    size='medium'
                                    boundaryRange={1}
                                    siblingRange={1}
                                    totalPages={this.state.totalPages}
                            // Heads up! All items are powered by shorthands, if you want to hide one of them, just pass `null` as value
                                    ellipsisItem={'...'}
                        />
                    </Responsive>
                    <Responsive {...Responsive.onlyMobile} >
                        <Pagination compact


                                    onPageChange={this.handlePaginationChange}
                                    defaultActivePage={1}
                                    size='large'
                                    boundaryRange={1}
                                    siblingRange={0}
                                    totalPages={this.state.totalPages}
                                    firstItem={null}
                                    lastItem={null}
                            // Heads up! All items are powered by shorthands, if you want to hide one of them, just pass `null` as value
                                    ellipsisItem={'...'}
                        />
                    </Responsive>
                </Grid.Column>
            </Grid>);
    }

}

export default MoveList;