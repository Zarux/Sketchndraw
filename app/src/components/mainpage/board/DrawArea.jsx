import React, {Component} from 'react';
import socket from '../../../socket'

export default class DrawArea extends Component{

    canvas = null;

    constructor(props){
        super(props);
        this.state = {
            remoteDrawing: false,
            drawingMode: false,
            color: "#000",
            width: 5
        }
    }

    handleMouseDown = (event) => {
        this.state.drawingMode = true;
        this.setState(this.state)
    };

    handleMouseUp = (event) => {
        this.state.drawingMode = false;
        socket.emit("mouse-up", this.canvas.toJSON());
    };

    handleMouseLeave = (event) => {
        this.state.drawingMode = false;
        this.setState(this.state)
    };

    handleMouseMove = (event) => {
        if(!this.state.drawingMode){
            return
        }

        const drawingData = {
            room: this.props.room,
            mouse: this.canvas.getPointer(event.e),
            color: this.state.color,
            width: this.state.width
        };
        socket.emit("mouse-move", drawingData);
    };

    componentDidMount(){
        this.canvas = new fabric.Canvas('paper', {
            isDrawingMode: true,
            selection: false,
            height: this.paper.parentNode.offsetHeight * 0.8,
            width: this.paper.parentNode.offsetWidth * 0.9,
        });

        this.canvas.on('mouse:move', this.handleMouseMove);
        this.canvas.on('mouse:down', this.handleMouseDown);
        this.canvas.on('mouse:up', this.handleMouseUp);
        this.canvas.on('mouse:leave', this.handleMouseLeave);

        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        this.canvas.remotePen = new fabric.PencilBrush(this.canvas);
        this.canvas.freeDrawingBrush.color = this.state.color;
        this.canvas.freeDrawingBrush.width = this.state.width;
        this.canvas.on('mouse:move', this.handleMouseMove);

        socket.on("mouse-move-return", data => {
            this.canvas.remotePen.color = data.color;
            this.canvas.remotePen.width = data.width;
            if(!this.state.remoteDrawing){
                this.canvas.remotePen.onMouseDown(data.mouse);
                this.state.remoteDrawing = true;
            }
            this.canvas.remotePen.onMouseMove(data.mouse);
        });

        socket.on("mouse-up-return", data => {
            this.canvas.remotePen.onMouseUp();
            this.state.remoteDrawing = false;
        });

        socket.emit("full-drawing");
        socket.on("full-drawing-return", data => {
            if(data){
                this.canvas.loadFromJSON(data, this.canvas.renderAll.bind(this.canvas));
            }
        });
    }

    render(){
        const style = {
            marginLeft:"5%",
            marginTop:"5%",
            border:"1px solid black"
        };
        return(
            <canvas
                id="paper"
                ref={ref => this.paper = ref}
                style={style}
            />
        )
    }
}