import {Form, Label, Responsive, Select} from "semantic-ui-react";
import React, {Component} from "react";

class DiscSelect extends Component {


    discOptions = [];

    constructor(props) {
        super(props);
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
            {key: '12', value: '12', text: '12 discs'},
            {key: '13', value: '13', text: '13 discs'},
            {key: '14', value: '14', text: '14 discs'},
            {key: '15', value: '15', text: '15 discs'},
            {key: '16', value: '16', text: '16 discs'},
            {key: '17', value: '17', text: '17 discs'},
            {key: '18', value: '18', text: '18 discs'},
            {key: '19', value: '19', text: '19 discs'},
            {key: '20', value: '20', text: '20 discs'},
        ];

    }

    render() {

        if (this.props.complex) {

            return (<Form key={this.props.subKey}>
                <Form.Field inline>
                    <Responsive {...Responsive.onlyComputer} as={Label} size='large'
                                position='right'>
                        Select the number of discs to initiate the solution:
                    </Responsive>
                    <Responsive {...Responsive.onlyTablet} >
                        <Label size='large' pointing="below">
                            Select the number of discs to initiate the solution:
                        </Label>
                    </Responsive>
                    {this.props.displayLabel && <Responsive {...Responsive.onlyMobile}>
                        <Label size='large' pointing='below'>
                            Select the number of discs to initiate the solution:
                        </Label>
                    </Responsive>}
                    <Select key={this.props.subKey} options={this.discOptions}
                            onChange={this.props.handleDiscSelect}>

                    </Select>
                </Form.Field>
            </Form>);
        } else {

            return (

                <Select key={this.props.subKey} fluid={this.props.fluid} options={this.discOptions} placeholder={'Select a disc to start'}
                        onChange={this.props.handleDiscSelect}/>
            );
        }
    }
}

DiscSelect.defaultProps = {displayLabel: true, complex: true};

export default DiscSelect;