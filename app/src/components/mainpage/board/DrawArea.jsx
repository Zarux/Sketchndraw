import React, {Component} from 'react';
import socket from '../../../socket'

export default class DrawArea extends Component{

    canvas = null;
    drawingMode = false;
    remoteDrawing = false;
    isDrawer = true;
    pointer = null;

    constructor(props){
        super(props);
        this.state = {}
    }

    handleMouseDown = (event) => {
        if(this.isDrawer){
            this.drawingMode = true;
            this.pointer = this.canvas.getPointer(event.e);
        }

    };

    handleMouseUp = (event) => {
        if(this.isDrawer){
            this.drawingMode = false;
        }
    };

    handleMouseLeave = (event) => {
        if(this.isDrawer){
            this.state.drawingMode = false;
        }
    };

    handleMouseMove = (event) => {
        if(!this.drawingMode){
            return
        }
        this.state.pointer = this.canvas.getPointer(event.e);
        socket.emit("mouse-move", {
            mouse: this.pointer,
            color: this.color,
            width: this.penSize
        });
    };

    componentDidMount(){
        this.canvas = new fabric.Canvas('paper', {
            isDrawingMode: this.isDrawer,
            selection: false,
            height: this.paper.parentNode.offsetHeight * 0.8,
            width: this.paper.parentNode.offsetWidth * 0.9,
        });
        this.canvas.on('mouse:move', this.handleMouseMove);
        this.canvas.on('mouse:down', this.handleMouseDown);
        this.canvas.on('mouse:up', this.handleMouseUp);
        this.canvas.on('mouse:leave', this.handleMouseLeave);

        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        this.canvas.freeDrawingBrush.color = this.props.color;
        this.canvas.freeDrawingBrush.width = this.props.penSize;
        this.canvas.remotePen = new fabric.PencilBrush(this.canvas);
        this.canvas.on('mouse:move', this.handleMouseMove);

        socket.on("mouse-move-return", data => {
            this.canvas.remotePen.color = data.color;
            this.canvas.remotePen.width = data.width;
            if(!this.remoteDrawing){
                this.canvas.remotePen.onMouseDown(data.mouse);
                this.remoteDrawing = true;
            }
            this.canvas.remotePen.onMouseMove(data.mouse);
        });

        socket.on("mouse-up-return", data => {
            this.canvas.remotePen.onMouseUp();
            this.remoteDrawing = false;
        });

        socket.emit("request-full-drawing");

        socket.on("request-full-drawing", data => {
            if(this.drawingMode){
                this.canvas.freeDrawingBrush.onMouseUp(this.pointer);
                this.canvas.freeDrawingBrush.onMouseDown(this.pointer);
            }
            socket.emit("send-full-drawing1", {
                drawing: this.canvas.toJSON(),
                id: data.id
            });
        });
        socket.on("send-full-drawing", data => {
            socket.emit("send-full-drawing", data);
        });

        socket.on("full-drawing-return", data => {
            if(data.drawing){
                this.canvas.loadFromJSON(data.drawing, this.canvas.renderAll.bind(this.canvas));
            }
        });
    }

    render(){
        if(this.canvas) {
            this.canvas.freeDrawingBrush.color = this.props.color;
            this.canvas.freeDrawingBrush.width = this.props.penSize;
            if(this.props.clearCanvas){
                this.canvas.clear()
                this.props.onClearCanvas()
            }
        }

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