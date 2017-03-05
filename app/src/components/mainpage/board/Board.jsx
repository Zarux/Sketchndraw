import React, {Component} from 'react';
import socket from '../../../socket'
import WordPicker from './WordPicker'
import DrawArea from './DrawArea'
import Paper from 'material-ui/Paper';
import Tools from './Tools'

export default class Board extends Component {

    constructor(props){
        super(props);
        this.state = {
            penSize : 8,
            color: "#000",
            clearCanvas: false,
            words: [],
            chosenWord: -1
        };
        socket.on("clear-canvas", data => {
            this.setState({...this.state, clearCanvas: true});
        });
    }

    handleSizeChange = (event, value) => {
        this.setState({...this.state, penSize: value});
    };

    handleColorChange = (color, event) => {
        this.setState({...this.state, color: color.hex});
    };

    handleClearCanvas = (event) => {
        socket.emit("clear-canvas");
        this.setState({...this.state, clearCanvas: true});
    };

    handleOnClearedCanvas = (event) => {
        this.setState({...this.state, clearCanvas: false});
    };

    onWordChosen = (word) => {
        this.setState({...this.state, chosenWord: word});
    };

    render(){
        const style = {
            float: "left",
            height: "700px",
            width: 825,
            marginLeft: "2%",
            marginRight: "2%",
            position: "relative",
            display: "inline-block"
        };

        let wordPicker = (
            <WordPicker
                open={this.state.chosenWord === -1 && this.props.isGame}
                words={this.props.words}
                onWordChosen={this.onWordChosen}
            />
        );
        if(this.state.chosenWord !== -1){
            wordPicker = "";
        }

        return (

                <Paper style={style} zDepth={3}>

                    <DrawArea
                        color={this.state.color}
                        penSize={this.state.penSize}
                        clearCanvas={this.state.clearCanvas}
                        onClearCanvas={this.handleOnClearedCanvas}
                        isDrawer={this.props.isDrawer}
                    />

                    <Tools
                        handleColorChange={this.handleColorChange}
                        handleSizeChange={this.handleSizeChange}
                        handleClearCanvas={this.handleClearCanvas}
                        color={this.state.color}
                        penSize={this.state.penSize}
                        isDrawer={this.props.isDrawer}
                    />
                </Paper>
        )
    }
}