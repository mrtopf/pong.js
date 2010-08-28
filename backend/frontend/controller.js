
function log(s) {
    if (console.log) {
        console.log(s);
    }
}


/*
The main game controller implementing the communication aspect
*/
function GameController(renderer) {

    var type,
        ball,
        paddle1,
        paddle2,
        conn;
        
    var CMDS = {
        
        // get information if we are master or slave
        ack: function(conn, payload) {
            type = payload.type;
        },
        
        // two players have been paired, master shows start button
        initialized: function(conn, payload) {
            //renderer.start();
            if (type==="master") {
                $("#startbutton_container").fadeIn(500);
                $("#startbutton").click(function() {
                    $("#startbutton_container").fadeOut(500);
                    send("start");
                })
            }
        },
        
        // the master pressed start, we start rendering
        start: function() {
            if (type==="master") {
                renderer.set_master();
            } else {
                renderer.set_slave();
            }
            renderer.start();
        },
        
        // status update from master to slave
        s: function(conn, payload) {
            renderer.set_status(
                    payload.s[0],
                    payload.s[1],
                    payload.s[2],
                    type);
            renderer.draw();
        },
        
        // paddle update from slave to master
        p: function(conn, payload) {
            renderer.set_paddle(payload.y);
        }
        
        
    }

    function init() {
        // initialize the websocket stuff
        conn = new WebSocket("ws://"+document.location.host+"/");

        conn.onmessage = handle_message;
        conn.onclose = handle_close;
        conn.onopen = handle_open;
    }
    
    function send(cmd, payload) {
        var payload = payload || {};
        
        var pl = {
            'c' : cmd,
        }

        for (var a in payload) {
             pl[a] = payload[a];
        }
        //log("sending "+JSON.stringify(pl))
        conn.send(JSON.stringify(pl));
    }
    
    function handle_open() {
        log("opened WS connection");
        send("init");
    }
    
    function handle_message(evt) {
        var data = JSON.parse(evt.data);
        //log("received msg "+evt.data);
        var cmd = data.c;
        CMDS[cmd](conn, data);
    }
    
    function handle_close () {
        // body...
    }
    
    function send_status(py,bx,by) {
        send("s",{s: [py,bx,by] })
    }
    
    // send only the paddle information. used by the slave
    function send_paddle(y) {
        send("p", {y:y})
    }
    
    return {
        init: init,
        send_status : send_status,
        send_paddle : send_paddle
    }
    
}