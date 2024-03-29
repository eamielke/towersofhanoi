import React, {Component} from 'react';
import {Table, Grid, Pagination, Responsive, Popup, Button} from 'semantic-ui-react';
import {composePage, calcTotalPages} from "./PagingUtil";

class MoveList extends Component {

    pageSize = 5;

    constructor(props) {
        super(props);

        let totalPages = calcTotalPages(this.props.moveHistory, this.pageSize);

        this.handlePaginationChange = this.handlePaginationChange.bind(this);

        this.state = {
            currentPageData: composePage(this.props.moveHistory, this.pageSize, 0),
            currentPage: 0,
            totalPages: totalPages,
            pageSize: this.pageSize
        };

    }


    componentDidMount() {
        //console.log('Mounting movelist component');
        this.props.scrollToMoveListRef();
    }


    handlePaginationChange(e, {activePage}) {

        let normalizedPage = activePage - 1;
        if (normalizedPage < 0) {
            normalizedPage = 0;
        }

        this.setState({
            currentPageData: composePage(this.props.moveHistory, this.pageSize, normalizedPage),
            currentPage: normalizedPage
        });

    }

    componentWillUnmount() {
        //console.log('Unmounting movelist component');
    }


    render() {

        const Component = this.props.as || 'div';

        if (this.props.displayMoveList && this.props.moveHistory && this.props.moveHistory.length > 0) {

            return (
                <Component>
                    <Grid id={this.props.id} columns={1}>
                        <Grid.Column>
                            <Table key={this.state.totalPages} celled unstackable>

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
                                                    <Table.Cell> {"Moved disc " + item.disc + " from tower " + item.sourceTowerNumber + " to tower "
                                                    + item.targetTowerNumber} </Table.Cell>
                                                    <Table.Cell>
                                                        <Responsive {...Responsive.onlyComputer} >
                                                            <Table unstackable>
                                                                <Table.Header>
                                                                    <Table.Row>
                                                                        <Table.HeaderCell>Tower #</Table.HeaderCell>
                                                                        <Table.HeaderCell>Disc Order</Table.HeaderCell>
                                                                    </Table.Row>
                                                                </Table.Header>
                                                                <Table.Body>

                                                                    {
                                                                        item.endingTowerStates.map((towerState, index) => {
                                                                                return (<Table.Row key={index + 1}>
                                                                                    <Table.Cell>{index + 1}</Table.Cell>
                                                                                    <Table.Cell>{towerState}</Table.Cell>
                                                                                </Table.Row>);
                                                                            }
                                                                        )
                                                                    }


                                                                </Table.Body>
                                                            </Table>
                                                        </Responsive>
                                                        <Responsive {...Responsive.onlyMobile} >
                                                            <Popup
                                                                trigger={<Button icon='add'/>}
                                                                on={'click'}
                                                                basic
                                                                position={'top right'}
                                                                flowing
                                                            >
                                                                <Grid stackable={false} celled container padded>

                                                                    {
                                                                        item.endingTowerStates.map((towerState, index) => {
                                                                                return (
                                                                                    <Grid.Row columns={1} divided
                                                                                              key={index + 1}>
                                                                                        <Grid.Column width={16}>
                                                                                            {towerState}
                                                                                        </Grid.Column>
                                                                                    </Grid.Row>);
                                                                            }
                                                                        )
                                                                    }


                                                                </Grid>
                                                            </Popup>
                                                        </Responsive>
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
                    </Grid>
                </Component>)
        } else {
            return null;
        }
    }

}

export default MoveList;