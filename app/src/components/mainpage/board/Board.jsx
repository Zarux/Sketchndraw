import React, {Component} from 'react';
import socket from '../../../socket'
import DrawArea from './DrawArea'
import Paper from 'material-ui/Paper';
import Tools from './Tools'

export default class Board extends Component {

    constructor(props){
        super(props);
        this.state = {
            penSize : 8,
            color: "#000",
            clearCanvas: false
        }
    }

    handleSizeChange = (event, value) => {
        this.setState({...this.state, penSize: value});
    };

    handleColorChange = (color, event) => {
        this.state.color = color.hex;
        this.setState({...this.state, color: color.hex});
    };

    handleClearCanvas = (event) => {
        this.state.clearCanvas = true;
        this.setState({...this.state, clearCanvas: true});
    };

    handleOnClearedCanvas = (event) => {
        this.state.clearCanvas = false;
        this.setState({...this.state, clearCanvas: false});
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
        return (

                <Paper style={style} zDepth={3}>
                    <DrawArea
                        color={this.state.color}
                        penSize={this.state.penSize}
                        clearCanvas={this.state.clearCanvas}
                        onClearCanvas={this.handleOnClearedCanvas}
                    />

                    <Tools
                        handleColorChange={this.handleColorChange}
                        handleSizeChange={this.handleSizeChange}
                        handleClearCanvas={this.handleClearCanvas}
                        color={this.state.color}
                        penSize={this.state.penSize}
                    />
                </Paper>
        )
    }
}