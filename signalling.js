(function(){
    function itself(server, sessionParser){
        const HTTPS_PORT = 8443;

        const fs = require('fs');
        const https = require('https');
        const WebSocket = require('ws');
        const WebSocketServer = WebSocket.Server;

        // Yes, SSL is required
        const serverConfig = {
            key: fs.readFileSync('server.key'),
            cert: fs.readFileSync('server.crt'),
        };

        // ----------------------------------------------------------------------------------------

        // Create a server for the client html page
        var handleRequest = function(request, response) {
            // Render the single client html file for any request the HTTP server receives
            console.log('request received: ' + request.url);

            if(request.url === '/') {
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(fs.readFileSync('public/client_demo.html'));
            } else if(request.url === '/webrtc.js') {
                response.writeHead(200, {'Content-Type': 'application/javascript'});
                response.end(fs.readFileSync('public/webrtc.js'));
            }
        };

        var httpsServer = https.createServer(serverConfig, handleRequest);
        httpsServer.listen(HTTPS_PORT, '0.0.0.0');

        // ----------------------------------------------------------------------------------------

        // Create a server for handling websocket calls
        var wss = new WebSocketServer({server: server});

        wss.on('connection', function(ws) {
            var session;
            sessionParser(ws.upgradeReq, {}, function(){
                console.log("New websocket connection");
                session = ws.upgradeReq.session;
            });
            ws.on('message', function(message) {
                // Broadcast any received message to all clients
                console.log('received: %s', message);
                wss.broadcast(message);
            });

            ws.on('close', function(){
                console.log("CLOSING");
                console.log(session);
            });
        });

        wss.broadcast = function(data) {
            this.clients.forEach(function(client) {
                if(client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        };

        console.log('Server running. Visit https://localhost:' + HTTPS_PORT + ' in Firefox/Chrome (note the HTTPS; there is no HTTP -> HTTPS redirect!)');
    }

    module.exports = itself;
})();