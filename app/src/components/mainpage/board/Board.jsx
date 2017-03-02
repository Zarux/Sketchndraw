import React, {Component} from 'react';
import socket from '../../../socket'
import Paper from 'material-ui/Paper';
export default class Board extends Component {

    constructor(props){
        super(props);
    }

    render(){
        const style = {
            float: "left",
            height: "700px",
            width: "50%",
            marginLeft: "2%",
            marginRight: "2%",
            position: "relative",
            display: "inline-block"
        };
        return (
            <Paper style={style} zDepth={3}>
                <canvas
                    style={{
                        width:"90%",
                        height: "90%",
                        marginLeft:"5%",
                        marginTop:"5%",
                        border:"1px solid black"
                    }} />
            </Paper>
        )
    }
}