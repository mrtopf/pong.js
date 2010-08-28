var conn;

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
    	//conn.send(y);
    }

    function draw() {
    	ctx.fillStyle = "#ffffff";
    	parts.rect(ctx, x,y,WIDTH,HEIGHT);
    }
    
    function set_y(new_y) {
        y = new_y;
    }
    
    function get_status() {
        return {x:x,y:y}
    }
    
    function set_status(py) {
        y = py;
    }
    
    return {
        width : WIDTH,
        height : HEIGHT,
        draw: draw,
        set_y: set_y,
        get_status: get_status,
        set_status: set_status
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
    
    function get_status() {
        return {x:x,y:y}
    }
    
    function set_status(bx,by) {
        x = bx;
        y = by;
    }

    return {
    	width : WIDTH,
    	height : HEIGHT,
    	move : move,
    	draw : draw,
    	get_status: get_status,
    	set_status: set_status
    }
}


function Pong() {
    
    var controller;

    var canvas_width,
	    canvas_height,
	    paddle1,
	    paddle2,
	    ball,
	    type,
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
    	var bs = ball.get_status();
    	var ps = paddle1.get_status();
	    controller.send_status(ps.y,bs.x,bs.y);
    }
    
    function set_status(py,bx,by,type) {
        ball.set_status(bx,by);
        paddle1.set_status(py);
    }
    
    // start the actual game
    function start() {
        if (type==="master") {
            // create render loop
            intervalId = setInterval(main, 10);
            return intervalId;            
        } else {
            // something to do here?
        }
    }
    
    /* initialize the renderer with the controller to use
    */
    
    function init(c) {
        log("set controller "+c)
        controller = c;
        
        ctx = $('#canvas')[0].getContext("2d");
        canvas_width = $("#canvas").width();
        canvas_height = $("#canvas").height();
    }
    
    function set_slave () {
        type = "slave";
        paddle1 = Paddle(ctx, 20,20);
        paddle2 = Paddle(ctx, canvas_width-40,80, true);
        ball = Ball(ctx, 100,120);
    }

    function set_master () {
        type = "master";
        paddle1 = Paddle(ctx, 20,20, true);
        paddle2 = Paddle(ctx, canvas_width-40,80);
        ball = Ball(ctx, 100,120);
    }

    return {
        init: init,
        start: start,
        draw: draw,
        set_status: set_status,
        set_slave: set_slave,
        set_master: set_master
    }
}

$(document).ready(function() {
    p = Pong();
    g = GameController(p);
    p.init(g);
    g.init();
});

