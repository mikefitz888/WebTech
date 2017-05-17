"use strict";
(function(){
    function itself(server, sessionParser){
        const HTTPS_PORT = 8443;

        const fs = require('fs');
        const EventEmitter = require('events');
        const https = require('https');
        const WebSocket = require('ws');
        const WebSocketServer = WebSocket.Server;

        // Yes, SSL is required
        const serverConfig = {
            key: fs.readFileSync('server.key'),
            cert: fs.readFileSync('server.crt'),
        };

        // ----------------------------------------------------------------------------------------
        // Create a server for handling websocket calls
        var wss = new WebSocketServer({server: server});

        // WebSocket Message Handler (per user)
        var UserEventHandlers = {};
        class UserEventHandler extends EventEmitter {
            constructor(ws) {
                super();

                this.partner;

                ws.on('message', (message)=>{
                    console.log(message);
                    var m = JSON.parse(message); // message = {event: event, message: [args...]}
                    this.emit.apply(this, [m.event].concat(m.message)); //This should emulate this.emit(event, arg1, arg2...)
                });

                // Self triggered events
                this.on('ownSessionDescription', (description)=>{
                    if(this.partner) {
                        this.partner.emit('otherSessionDescription', description);
                    } else {
                        console.error("[ERROR!] " + ws.upgradeReq.session.username + " has no partner.");
                    }
                });

                this.on('requestPeerConnection', (peer)=>{
                    this.partner = UserEventHandlers[peer];
                    this.partner.partner = this;
                    this.partner.emit('peerConnection');
                });

                this.on('ownICECandidate', (candidate)=>{
                    if(this.partner) {
                        this.partner.emit('otherICECandidate', candidate);
                    } else {
                        console.error("[ERROR!] " + ws.upgradeReq.session.username + " has no partner.");
                    }
                });

                // Partner triggered events
                this.on('otherICECandidate', (candidate)=>{
                    ws.send(JSON.stringify({
                        event: 'ICECandidate',
                        message: [candidate]
                    }));
                });

                this.on('otherSessionDescription', (description)=>{
                    ws.send(JSON.stringify({
                        event: 'sessionDescription',
                        message: [description]
                    }));
                });

                this.on('peerConnection', ()=>{
                    ws.send(JSON.stringify({
                        event: 'peerConnection'
                        //message not specified to test client-side robustness (+ no message is needed here)
                    }));
                });
            }
        }

        // ----------------------------------------------------------------------------------------

        

        var pairings = new Object();
        pairings = {
            helper: "admin",
            admin: "helper"
        }
        var socketMap = new Object();

        wss.on('connection', function(ws) {
            var session;
            sessionParser(ws.upgradeReq, {}, function(){
                console.log("New websocket connection");
                UserEventHandlers[ws.upgradeReq.session.username] = new UserEventHandler(ws);

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
