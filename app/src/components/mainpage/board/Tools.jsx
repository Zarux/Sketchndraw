import React, {Component} from 'react';
import socket from '../../../socket'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import Slider from 'material-ui/Slider';
import RaisedButton from 'material-ui/RaisedButton';
import Lens from 'material-ui/svg-icons/image/lens'
import Delete from 'material-ui/svg-icons/action/delete'
import ExpandMore from 'material-ui/svg-icons/navigation/expand-more'
import ExpandLess from 'material-ui/svg-icons/navigation/expand-less'
import Palette from 'material-ui/svg-icons/image/palette'
import {CompactPicker} from 'react-color';

export default class Tools extends Component{
    buttonIconStyle = {
        paddingTop: 5,
        color: "#fff"
    };

    constructor(props){
        super(props);
        this.state = {
            showColor: false,
        }
    }

    handleClick = (event) => {
        this.setState({...this.state, showColor: !this.state.showColor});
    };

    render(){
        const style = {
            position: "absolute",
            bottom: 0,
            width: "100%",
            minWidth: "100%",
            height: "15%",
            backgroundColor: "rgba(0,0,0,0)"
        };
        return (
            <Toolbar style={style}>
                <ToolbarGroup firstChild={true}>
                    {this.state.showColor ? (
                        <div style={{paddingTop:"25%", position:"absolute"}}>
                            <CompactPicker onChange={this.props.handleColorChange} />
                        </div>
                        ): ""}
                    <RaisedButton
                        style={{width:10}}
                        label={<Palette style={this.buttonIconStyle}/>}
                        backgroundColor={this.props.color}
                        onClick={this.handleClick}
                    />
                    <ToolbarSeparator />
                    <Slider
                        defaultValue={this.props.penSize}
                        value={this.props.penSize}
                        min={3}
                        max={40}
                        style={{width: 200, paddingLeft: "5%", paddingTop:"3%"}}
                        step={1}
                        onChange={this.props.handleSizeChange}
                    />
                    <ToolbarSeparator />
                    <RaisedButton
                        label={<Delete style={{paddingTop:5, color:"#747474"}} />}
                        onClick={this.props.handleClearCanvas}
                    />
                    <ToolbarSeparator />
                </ToolbarGroup>
                <ToolbarGroup lastChild={true} style={{paddingRight:100}}>
                    <Lens style={{paddingLeft: 10, height:this.props.penSize, width:this.props.penSize, color:this.props.color}}/>
                </ToolbarGroup>
            </Toolbar>
        )
    }
};
