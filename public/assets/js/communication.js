"use strict";
/*
    Browser Requirements: (I'm choosing to support Chrome/FireFox only for now)
    Chrome:
        Enable: Experimental Extension APIs in chrome://flags
    Firefox:
        Shouldn't need any extras, I had disabled some flags for privacy-enhancement which prevented RTC from working. These had to be returned to default.
        The Screensharing whitelist is no longer needed to share your screen or windows starting Firefox 52 (April).
        If using earlier version, add localhost to media.getusermedia.screensharing.allowed_domains in about:config
*/
var peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
};

/*
    Messages to and from the server take the following format:
    {event: string, message: [args]}
*/
var CommunicationServer = function(){
    var _this = this;
    this.event_list = {};

    console.log("CommunicationServer created.");
    this.peerConnection;
    this.serverConnection = new WebSocket('wss://' + window.location.hostname + ':443');
    this.serverConnection.onmessage = (message)=>{
        console.log(message);
        var signal = JSON.parse(message.data);
        console.log(signal);

        if(this.event_list.hasOwnProperty(signal.event)) {
            _this.event_list[signal.event].apply(this, signal.message || []); //Prevent packet with no message from causing error
        } else {
            console.log("No event specified for " + signal.event);
        }
    };

    //this.send = function(message){_this.serverConnection.send(message);}

    this.on('ICECandidate', (candidate)=>{
        console.log(candidate);
        if (!candidate) return; // A 'NULL' candidate represents end of candidate stream
        this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate) ).then(()=> {
            console.log("Added Ice Candidate");
        }).catch((error)=> {
            console.log(error);
        });
    });

    this.on('infoPacket', (info_packet)=>{
        var el = createInfoPanel('Overview').append($('<p></p>')
            .append(createInfoSection('System').append(createInfoElement('OS', info_packet.platform)).append(createInfoElement('Browser', info_packet.appCodeName)))
            .append(createInfoSection('Screen').append(createInfoElement('Width', info_packet.screen_width)).append(createInfoElement('Height', info_packet.screen_height)))
        );

        var details = createInfoPanel('Details').append($('<p></p>')
            .append(createInfoSection('User-Agent').append('<span class="info-element full"><span class="info-name">'+info_packet.userAgent+'</span></span>'))
        );
        //var el = createInfoPanel('TITLE').append($('<p></p>').append(createInfoSection('System').append(createInfoElement('OS', navigator.platform)).append(createInfoElement('Browser', navigator.appCodeName))));
        $('#side_panel_right').append(el);
        $('#side_panel_right').append(details);
    });
}

/*
    Server communication methods.
*/

CommunicationServer.prototype.on = function(event, callback){
    if(this.event_list.hasOwnProperty(event)) console.log("Overwriting callback: " + event);
    else console.log("Adding callback: " + event);
    this.event_list[event] = callback;
}

CommunicationServer.prototype.send = function(event, message=[]){
    this.serverConnection.send(JSON.stringify({
        event: event,
        message: message
    }));
}

/*
    Promise-based server interface methods.
*/

CommunicationServer.prototype.sendICECandidate = function(IceCandidate){
    console.log("ICE Candidate sent.");
    this.send("ownICECandidate", IceCandidate.candidate);
}

CommunicationServer.prototype.sendDescription = function(localDescription){
    console.log("Send Description");
    this.send("ownSessionDescription", localDescription);
}

CommunicationServer.prototype.recieveDescription = function(){
    return new Promise((resolve, reject)=> {
        this.on("sessionDescription", (description)=>{
            console.log("Description recieved.");
            resolve(description);
        });
    });
}

CommunicationServer.prototype.awaitPeerConnection = function(){
    return new Promise((resolve, reject)=> {
        this.on("peerConnection", ()=>{
            console.log("Peer Connected");
            resolve();
        });
    });
}

CommunicationServer.prototype.ready = function(){
    return new Promise((resolve, reject)=> {
        this.serverConnection.onopen = resolve;
    });
}

function createPeerConnection(server){
    var peerConnection = new RTCPeerConnection(peerConnectionConfig);
    server.peerConnection = peerConnection;
    peerConnection.onicecandidate = server.sendICECandidate.bind(server); //Need to bind here, otherwise 'this' comes from the caller
    return peerConnection;
}

function sendCall(peer){ //PC2
    var server = new CommunicationServer();
    var peerConnection = createPeerConnection(server);
    $('#setup-call').hide();
    $('.loading').show();

    //onaddstream is deprecated, use ontrack instead
    peerConnection.onaddstream = setStreamDisplay;
    server.ready().then(()=> {
        server.send('requestPeerConnection', [peer]);
        server.recieveDescription().then((description)=> {
            peerConnection.setRemoteDescription(new RTCSessionDescription(description)).catch((error)=>{console.log(error);});
            peerConnection.createAnswer().then((description)=> {
                peerConnection.setLocalDescription(description).then(()=> {
                    server.sendDescription(description);
                    $('.loading').hide();
                    $('#remoteVideo').show();
                }).catch((error)=>{console.log(error);});
            }).catch((error)=> {
                console.log(error);
            });
        }).catch((error)=> {console.log(error);});
    }).catch((error)=> {console.log(error);});
}

function awaitCall(info_packet){ //PC1
    var server = new CommunicationServer();
    var peerConnection = createPeerConnection(server);

    var constraints = {
        video: {
            mediaSource: 'window' || 'screen'
        },
        audio: false,
    };

    console.log("Trying to get media device");
    navigator.mediaDevices.getUserMedia(constraints).then((stream)=>{
        document.getElementById('remoteVideo').src = window.URL.createObjectURL(stream);
        $('#setup-call').hide();
        $('.loading').show();
        server.send('infoPacket', info_packet);
        server.awaitPeerConnection().then(()=>{
            //server.ready().then(()=>{
                
                peerConnection.addStream(stream);
                peerConnection.createOffer().then((description)=>{
                    peerConnection.setLocalDescription(description).then(()=>{
                        server.sendDescription(description);
                        server.recieveDescription().then((description)=>{
                            peerConnection.setRemoteDescription( new RTCSessionDescription(description) );
                            $('.loading').hide();
                            $('#remoteVideo').show();
                        }).catch((error)=>{console.log(error);});
                    }).catch(setLocalDescriptionError);
                }).catch( createOfferError );
            //});
        });
    }).catch((error)=>{console.log(error);});
}

function setStreamDisplay(stream){
    document.getElementById('remoteVideo').src = window.URL.createObjectURL(stream.stream);
}

function createOfferSuccess(description){
    this.setLocalDescription(description).then( setLocalDescriptionSuccess ).catch( setLocalDescriptionError );
}

function setLocalDescriptionSuccess(){ console.log("Local description set."); }

function createOfferError(error){ console.log(error); }
function setLocalDescriptionError(error){ console.log(error); }

function createInfoElement(name, entry){
    return $(   '<span class="info-element">\
                    <span class="info-name">'+name+'</span>\
                    <span class="info-entry">'+entry+'</span>\
                </span>' );
}

function createInfoSection(title){
    return $(   '<span class="info-section">\
                    <span class="info-title">'+title+'</span>\
                </span>');
}

function createInfoPanel(title){
    return $(   '<span class="info-panel-sub active">\
                    <h2><i class="fa fa-globe" aria-hidden="true"></i>'+title+'</h2>\
                </span>');
}