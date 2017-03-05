import React, {Component, PropTypes} from 'react';
import Dialog from 'material-ui/Dialog';
import socket from '../../../socket'
import RaisedButton from 'material-ui/RaisedButton';
import {List, ListItem, makeSelectable} from 'material-ui/List';
let SelectableList = makeSelectable(List);


function wrapState(ComposedComponent) {
    return class SelectableList extends Component {
        static propTypes = {
            children: PropTypes.node.isRequired,
            defaultValue: PropTypes.number.isRequired,
        };

        componentWillMount() {
            this.setState({
                selectedIndex: this.props.defaultValue,
            });
        }

        handleRequestChange = (event, index) => {
            this.setState({
                selectedIndex: index,
            });
        };

        render() {
            return (
                <ComposedComponent
                    value={this.state.selectedIndex}
                    onChange={this.handleRequestChange}
                >
                    {this.props.children}
                </ComposedComponent>
            );
        }
    };
}

SelectableList = wrapState(SelectableList);


export default class WordPicker extends Component {

    constructor(props) {
        super(props);
        this.state = {
            chosenWord: -1
        }
    }

    handleClick = (event) => {
        this.props.onWordChosen(this.state.chosenWord);
    };

    handleItemClick = (chosenWord) => {
      this.setState({...this.state, chosenWord: chosenWord});
    };

    mapWords = (words) => {
        return words.map((word, i) => {
           return (
               <ListItem
                   key={i}
                   value={i}
                   primaryText={word}
                   onClick={()=>{this.handleItemClick(i)}}
                />
           )
        });
    };

    render(){
        const action = (
            <RaisedButton
                disabled={this.state.chosenWord === -1}
                label="Choose"
                onClick={this.handleClick}
            />
        );
        return(
            <Dialog
                style={{
                    width: "20%",
                    left:"40%"
                }}
                overlayStyle={{
                    backgroundColor:"rgba(0,0,0,0)"
                }}
                open={this.props.open}
                modal={false}
                actions={action}
            >
                <h2>Pick a word</h2>
                <SelectableList defaultValue={this.state.chosenWord} children={this.mapWords(this.props.words)} />

            </Dialog>
        )
    }

}