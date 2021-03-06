import React, {Component} from 'react';
import socket from '../../../socket'
import store from '../../../store'

export default class DrawArea extends Component{

    canvas = null;
    drawingMode = false;
    remoteDrawing = false;
    pointer = null;
    sendMouseMove = true;
    isDrawing = false;

    constructor(props){
        super(props);
        this.state = {};
    }

    disableDrawing = () => {
        this.canvas.isDrawingMode = false;
        this.canvas.freeDrawingBrush._reset();
        this.canvas.removeListeners();
    };

    enableDrawing = () =>{
        this.canvas.isDrawingMode = true;
        this.canvas.removeListeners();
        this.canvas._initEventListeners();
        this.canvas.on('mouse:move', this.handleMouseMove);
        this.canvas.on('mouse:down', this.handleMouseDown);
        this.canvas.on('mouse:up', this.handleMouseUp);
        this.canvas.on('mouse:leave', this.handleMouseLeave);
        this.canvas.freeDrawingBrush.color = this.props.color;
        this.canvas.freeDrawingBrush.width = this.props.penSize;
    };

    handleMouseDown = (event) => {
        if(this.isDrawing){
            this.drawingMode = true;
            this.pointer = this.canvas.getPointer(event.e);
            socket.emit("mouse-down", {
                pointer: this.pointer,
                color: this.props.color,
                width: this.props.penSize
            });
        }
    };

    handleMouseUp = (event) => {
        if(this.isDrawing){
            this.drawingMode = false;
            socket.emit("mouse-up", this.pointer);
        }
    };

    handleMouseLeave = (event) => {
        if(this.isDrawing){
            this.drawingMode = false;
        }
    };

    handleMouseMove = (event) => {
        if(!this.drawingMode){
            return
        }
        if(!this.sendMouseMove){
            this.sendMouseMove = true;
            return;
        }
        this.pointer = this.canvas.getPointer(event.e);
        this.sendMouseMove = false;
        socket.emit("mouse-move", {
            pointer: this.pointer,
            color: this.props.color,
            width: this.props.penSize
        });
    };

    componentDidMount(){
        this.isDrawing = store.getState().drawer.isDrawing;
        this.canvas = new fabric.Canvas('paper', {
            isDrawingMode: true,
            selection: false,
            height: this.paper.parentNode.offsetHeight * 0.8,
            width: this.paper.parentNode.offsetWidth * 0.9,
        });

        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        this.canvas.remotePen = new fabric.PencilBrush(this.canvas);
        this.disableDrawing();
        socket.on("mouse-move-return", data => {
            this.canvas.remotePen.color = data.color;
            this.canvas.remotePen.width = data.width;
            if(!this.remoteDrawing){
                this.canvas.remotePen.onMouseDown(data.pointer);
                this.remoteDrawing = true;
            }
            this.canvas.remotePen.onMouseMove(data.pointer);
        });

        socket.on("mouse-up-return", data => {
            this.canvas.remotePen.onMouseUp(data);
            this.remoteDrawing = false;
        });

        socket.on("mouse-down-return", data => {
            this.canvas.remotePen.color = data.color;
            this.canvas.remotePen.width = data.width;
            this.canvas.remotePen.onMouseDown(data.pointer);
            this.remoteDrawing = true;
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

    componentDidUpdate(){
        this.isDrawing = store.getState().drawer.isDrawing;
        if(this.props.clearCanvas){
            this.canvas.clear();
            this.props.onClearCanvas()
        }
        if(this.isDrawing){
            this.enableDrawing();
        }else{
            this.disableDrawing();
        }
    }

    render(){
        if(this.canvas) {
            this.canvas.freeDrawingBrush.color = this.props.color;
            this.canvas.freeDrawingBrush.width = this.props.penSize;
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