
function log(s) {
    if (console.log) {
        console.log(s);
    }
}


/*
The main game controller implementing the communication aspect
*/
function GameController() {
    
    var type,
        ball,
        paddle1,
        paddle2,
        conn;
        
    var CMDS = {
        ack: function(conn, payload) {
            log(payload);
            type = payload.type;
            log(type);
        }
    }

    // initialize the websocket stuff
    conn = new WebSocket("ws://"+document.location.host+"/");

    conn.onmessage = handle_message;
    conn.onclose = handle_close;
    conn.onopen = handle_open;
    
    log(conn);
    
    function send(cmd, payload) {
        var payload = payload || {};
        
        var pl = {
            'c' : cmd,
        }

        for (var a in payload) {
             pl[a] = payload[a];
        }
        log("sending "+JSON.stringify(pl))
        conn.send(JSON.stringify(pl));
    }
    
    function handle_open() {
        log("opened WS connection");
        send("init");
    }
    
    function handle_message(evt) {
        var data = JSON.parse(evt.data);
        log("received msg "+evt.data);
        var cmd = data.c;
        CMDS[cmd](conn, data);
    }
    
    function handle_close () {
        // body...
    }
        
    return {
        
    }
    
}