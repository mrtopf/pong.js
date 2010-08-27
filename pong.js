var socket;

var parts = {

    rect : function (ctx,x,y,w,h) {
	ctx.beginPath();
	ctx.rect(x,y,w,h);
	ctx.closePath();
	ctx.fill();
    }
}


function Paddle(ctx,x,y,use_mouse) {

    var use_mouse = use_mouse || false;
    var WIDTH = 20;  // paddle width
    var HEIGHT = 80; // paddle height

    var ctx = ctx; 
    var x = x;
    var y = y;

    if (use_mouse) {
	$(document).mousemove(onMouseMove);
    }

    function onMouseMove(e) {
	y = e.pageY;
	socket.send(y);
    }

    function draw(){
	ctx.fillStyle = "#ffffff";
	parts.rect(ctx, x,y,WIDTH,HEIGHT);
    }
    
    return {
	width : WIDTH,
	height : HEIGHT,
	draw: draw
    }
}

function Ball(ctx, x, y) {
    var x = x;
    var y = y;

    var dx = 3;
    var dy = 4;

    var WIDTH = 15;
    var HEIGHT = 15;

    var canvas_width, canvas_height;

    var canvas_width = ctx.canvas.width;
    var canvas_height = ctx.canvas.height;

    function draw() {
	parts.rect(ctx, x, y, WIDTH, HEIGHT);
    }

    function move() {
	x += dx;
	y += dy;
	if (x>(canvas_width-WIDTH) || x<0) {
	    dx = -dx;
	}
	if (y>(canvas_height-HEIGHT) || y<0) {
	    dy = -dy;
	}
    }

    return {
	width : WIDTH,
	height : HEIGHT,
	move : move,
	draw : draw
    }
}


function Pong() {

    io.setPath('/client/');
    socket = new io.Socket("localhost", {rememberTransport: false, port: 8080});
    socket.connect();


    var canvas_width,
	canvas_height,
	paddle1,
	paddle2,
	ctx;

    function clear() {
	ctx.clearRect(0,0,canvas_width, canvas_height);
	parts.rect(ctx,0,0,canvas_width, canvas_height);
    }

    function draw() {
	ctx.fillStyle = "#000000";
	clear();
	paddle1.draw();
	paddle2.draw();
	ball.draw();
    };

    function main() {
	// move ball
	ball.move();
	draw();
    }


    ctx = $('#canvas')[0].getContext("2d");
    canvas_width = $("#canvas").width();
    canvas_height = $("#canvas").height();

    paddle1 = Paddle(ctx, 20,20, true);
    paddle2 = Paddle(ctx, canvas_width-40,80);
    ball = Ball(ctx, 100,120);

    // create render loop
    intervalId = setInterval(main, 10);
    return intervalId;


    
}

$(document).ready(Pong);
