Array.prototype.removeid = function(id) {
    for (var i=0; i<this.length; i++) {
        if (this[i]===id) {
            this.splice(i,1);
        }
    }
}


var Connect = require('connect');
var ws = require("websocket-server");

var server = Connect.createServer(
  //Connect.logger(),
  Connect.staticProvider(__dirname + '/frontend')
);


var ws_server = ws.createServer({server: server});
ws_server.addListener("connection", function(connection){
    console.log("connected with client "+connection.id);
    connection.addListener("message", function(msg){
        var e = JSON.parse(msg);
        //console.log("received command: "+e.c);
        cmds[e.c](connection, e);
  });
});

ws_server.addListener("close", function(connection){
    console.log("connection closed for client "+connection.id);
    waiting.removeid(connection.id)
    // TODO: delete from pairs and tell opponent
    
});


ws_server.listen(8000);

function send(client_id, cmd, payload) {
    var payload = payload || {};
    
    var pl = {
        'c' : cmd,
    }
    
    var payload = payload || {};
    for (var a in payload) {
        pl[a] = payload[a];
    }
    //console.log("sending "+JSON.stringify(pl))
    ws_server.send(client_id, JSON.stringify(pl));
    
}

///////////////////////////////////////////////////////////

var pairs = {},     // 
    waiting = [];   // players waiting for a game

var cmds = {
    init: function(connection, evt) {
        if (waiting.length===0) {
            // new master
            waiting.push(connection.id);
            send(connection.id, "ack", {'type' : 'master'})
        } else {
            var opp = waiting.pop();
            send(connection.id, "ack", {'type' : 'slave'})
            
            // remember the pair
            pairs[connection.id] = opp;
            pairs[opp] = connection.id;
            
            // now tell both that they are initialized
            send(opp, "initialized");
            send(connection.id, "initialized");
        }
    },
    start: function(connection, evt) {
        var me = connection.id;
        var you = pairs[me];
        send(me, "start");
        send(you, "start");
    },
    
    s: function(connection, evt) {
        var me = connection.id;
        var you = pairs[me];
        send(you, "s", evt);
        
    }
}