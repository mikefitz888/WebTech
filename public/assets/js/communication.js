"use strict";
/*
    Browser Requirements: (I'm choosing to support Chrome/FireFox only for now)
    Chrome:
        Enable: Experimental Extension APIs in chrome://flags
    Firefox:
        Shouldn't need any extras, I had disabled some flags for privacy-enhancement which prevented RTC from working. These had to be returned to default.
*/

var peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
};

var CommunicationServer = function(){
    var _this = this;
    console.log("CommunicationServer created.");
    this.peerConnection;
    this.serverConnection = new WebSocket('wss://' + window.location.hostname + ':443');
    this.serverConnection.onmessage = (message)=>{
        console.log(message);
        var signal = JSON.parse(message.data);
        console.log(signal);
        _this[signal.type](signal.message);
    };

    this.descriptionHandle = null;
    this.ICECandidateHandle = null;
    this.peerConnectionHandle = null;

    this.send = function(message){_this.serverConnection.send(message);}
}

CommunicationServer.prototype.sendICECandidate = function(IceCandidate){
    console.log("ICE Candidate sent.");
    this.send(JSON.stringify({
        type: "ice_candidate",
        message: IceCandidate.candidate
    }));
}

CommunicationServer.prototype.recieveICECandidate = function(candidate){
    console.log(candidate);
    if (!candidate) return;
    this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate) ).then(()=> {
        console.log("Added Ice Candidate");
    }).catch((error)=> {
        console.log(error);
    });
}

CommunicationServer.prototype.sendDescription = function(localDescription){
    console.log("Send Description");
    this.send(JSON.stringify({
        type: "session_description",
        message: localDescription
    }));
}

CommunicationServer.prototype.recieveDescription = function(){
    var _this = this;
    return new Promise((resolve, reject)=> {
        _this.descriptionHandle = function(description) {
            console.log("Description recieved.");
            resolve(description);
        }
    });
}

CommunicationServer.prototype.awaitPeerConnection = function(){
    var _this = this;
    return new Promise((resolve, reject)=> {
        _this.peerConnectionHandle = function() {
            console.log("Peer Connected");
            resolve();
        }
    });
}

CommunicationServer.prototype.ready = function(){
    var _this = this;
    return new Promise((resolve, reject)=> {
        _this.serverConnection.onopen = resolve;
    });
}

function createPeerConnection(server){
    var peerConnection = new RTCPeerConnection(peerConnectionConfig);
    server.peerConnection = peerConnection;
    peerConnection.onicecandidate = function(evt){server.sendICECandidate(evt);};
    return peerConnection;
}

function sendCall(){ //PC2
    var server = new CommunicationServer();
    var peerConnection = createPeerConnection(server);
    peerConnection.onaddstream = setStreamDisplay;
    server.ready().then(()=> {
        server.send(JSON.stringify({
            type: 'create_connection',
            partner: 'admin'
        }));
        server.recieveDescription().then((description)=> {
            peerConnection.setRemoteDescription(new RTCSessionDescription(description)).catch((error)=>{console.log(error);});
            peerConnection.createAnswer().then((description)=> {
                peerConnection.setLocalDescription(description).then(()=> {
                    server.sendDescription(description);
                }).catch((error)=>{console.log(error);});
            }).catch((error)=> {
                console.log(error);
            });
        }).catch((error)=> {console.log(error);});
    }).catch((error)=> {console.log(error);});
}

function awaitCall(){ //PC1
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
        server.awaitPeerConnection().then(()=>{
            peerConnection.addStream(stream);
            peerConnection.createOffer().then((description)=>{
                peerConnection.setLocalDescription(description).then(()=>{
                    server.sendDescription(description);
                    server.recieveDescription().then((description)=>{
                        peerConnection.setRemoteDescription( new RTCSessionDescription(description) );
                    }).catch((error)=>{console.log(error);});
                }).catch(setLocalDescriptionError);
            }).catch( createOfferError );
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
