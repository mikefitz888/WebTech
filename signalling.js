"use strict";
(function(){
    function itself(server, sessionParser, UserEventHandlers){
        const HTTPS_PORT = 443;

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
        class UserEventHandler extends EventEmitter {
            constructor(ws, username) {
                super();

                this.partner;
                this.help_request = true;
                this.displayed_description = ' - ' + username;
                this.username = username;
                this.info_packet;

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

                this.on('infoPacket', (info_packet)=>{
                    this.info_packet = info_packet;
                    this.displayed_description = info_packet.category + ' - ' + this.username;
                });

                this.on('requestPeerConnection', (peer)=>{
                    this.help_request = false;
                    this.partner = UserEventHandlers[peer];
                    this.partner.partner = this;
                    this.partner.emit('peerConnection');

                    ws.send(JSON.stringify({
                        event: 'infoPacket',
                        message: [this.partner.info_packet]
                    }));
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
                    this.help_request = false; //Peer has connected, no longer needs help
                    ws.send(JSON.stringify({
                        event: 'peerConnection'
                        //message not specified to test client-side robustness (+ no message is needed here)
                    }));
                });
            }
        }

        // ----------------------------------------------------------------------------------------

        wss.on('connection', function(ws) {
            var username;
            sessionParser(ws.upgradeReq, {}, function(){
                console.log("New websocket connection");
                username = ws.upgradeReq.session.username;
                UserEventHandlers[ws.upgradeReq.session.username] = new UserEventHandler(ws, username);

            });

            ws.on('close', function(){
                console.log("CLOSING");
                delete UserEventHandlers[username];
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
