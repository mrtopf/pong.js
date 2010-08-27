var Connect = require('connect');
var ws = require("websocket-server");



var server = Connect.createServer(
  Connect.logger(),
  Connect.staticProvider(__dirname + '/frontend')
);


var ws_server = ws.createServer({server: server});
ws_server.addListener("connection", function(connection){
    console.log("connected");
    connection.addListener("message", function(msg){
        ws_server.broadcast(msg);
  });
});

ws_server.listen(8000);
