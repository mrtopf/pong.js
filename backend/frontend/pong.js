var conn;

var parts = {

    rect : function (ctx,x,y,w,h) {
    	ctx.beginPath();
    	ctx.rect(x,y,w,h);
    	ctx.closePath();
    	ctx.fill();
    }
}


function Paddle(ctx,x,y,use_mouse,controller) {

    var controller = controller;
    var use_mouse = use_mouse || false;
    var WIDTH = 20;  // paddle width
    var HEIGHT = 80; // paddle height

    var ctx = ctx; 
    var x = x;
    var y = y;
    var top = $(ctx.canvas).offset().top;
    var canvas_height = ctx.canvas.height;

    if (use_mouse) {
	    $(document).mousemove(onMouseMove);
    }

    function onMouseMove(e) {
    	y = e.pageY-top;
    	if (y>(canvas_height-HEIGHT)) {
    	    y = canvas_height-HEIGHT;
    	}
    	if (y<0) {
    	    y=0;
    	}
    	controller.send_paddle(y)
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
    
    // return the outline for collision detection
    function get_outline() {
        return {
            x: x,
            y: y,
            h: HEIGHT,
            w: WIDTH
        }
    }
    
    return {
        width : WIDTH,
        height : HEIGHT,
        draw: draw,
        set_y: set_y,
        get_status: get_status,
        set_status: set_status,
        get_outline: get_outline
    }
}

function Ball(ctx, x, y) {
    var x = x;
    var y = y;

    var dx = 3;
    var dy = 4;

    var WIDTH = 14;
    var HEIGHT = 14;

    var canvas_width, canvas_height;

    var canvas_width = ctx.canvas.width;
    var canvas_height = ctx.canvas.height;

    function draw() {
	    parts.rect(ctx, x, y, WIDTH, HEIGHT);
    }

    function move(callback) {
    	x += dx;
    	y += dy;
    	if (x>(canvas_width-WIDTH) || x<0) {
    	    dx = -dx;
    	}
    	if (x<0) {
            callback(1);
    	}
    	if (x>(canvas_width-WIDTH)) {
    	    callback(2);
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
        
    // collision detection
    function coll_dtx(paddle, check_left) {
        var outline = paddle.get_outline();
        if (check_left) {
            if (
                (
                    (x<=(outline.x+outline.w))
                    && (x>= (outline.x))
                )
                && (y>outline.y)
                && (y<(outline.y+outline.h))) {
                dx = -dx;
            }            
        } else {
            if (((x+WIDTH)>=outline.x && ((x+WIDTH)<=(outline.x+outline.w)))
                && (y>outline.y) 
                && (y<(outline.y+outline.h))) {
                dx = -dx;
            }            
        }
    }
    
    return {
    	width : WIDTH,
    	height : HEIGHT,
    	move : move,
    	draw : draw,
    	get_status: get_status,
    	set_status: set_status,
    	coll_dtx: coll_dtx,
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

    var iid;

    function clear() {
    	ctx.clearRect(0,0,canvas_width, canvas_height);
    	parts.rect(ctx,0,0,canvas_width, canvas_height);
    }

    function draw() {
    	ctx.fillStyle = "#000000";
    	clear();
    	ctx.fillStyle = "#00aaff";
    	parts.rect(ctx, 398,0,4,400);
    	paddle1.draw();
    	paddle2.draw();
    	ball.draw();
    	ball.coll_dtx(paddle1,true);
    	ball.coll_dtx(paddle2);
    };

    function main() {
    	// move ball with callback if it's out
    	ball.move(controller.goal);
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
            iid = setInterval(main, 10); // remember the interval id to stop it later
        } else {
            // something to do here?
        }
    }
    
    // stop the game
    function stop() {
        clearInterval(iid);
    }
    
    /* initialize the renderer with the controller to use
    */
    
    function init(c) {
        controller = c;
                
        ctx = $('#canvas')[0].getContext("2d");
        canvas_width = $("#canvas").width();
        canvas_height = $("#canvas").height();
    }
    
    function set_slave () {
        type = "slave";
        reset();
    }

    function set_master () {
        type = "master";
        reset();
    }
    
    // set the paddle of the slave
    function set_paddle(y) {
        paddle2.set_status(y);
    }
    
    // reset the game to initial state
    function reset() {
        paddle1 = Paddle(ctx, 20, 160, true, controller);
        paddle2 = Paddle(ctx, canvas_width-40,160, false, controller);
        ball = Ball(ctx, 393,200);        
    }

    return {
        init: init,
        start: start,
        stop: stop,
        draw: draw,
        set_status: set_status,
        set_slave: set_slave,
        set_master: set_master,
        set_paddle: set_paddle,
        reset: reset
    }
}

$(document).ready(function() {
    p = Pong();
    g = GameController(p);
    p.init(g);
    g.init();
});

