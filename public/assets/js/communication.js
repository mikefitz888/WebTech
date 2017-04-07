var peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
};

var CommunicationServer = function(){
	this.peerConnection = peerConnection;
	this.serverConnection = new WebSocket('wss://' + window.location.hostname + ':3000');
    this.serverConnection.onmessage = this.parseMessage;

}

CommunicationServer.prototype.parseMessage = function(message){
	var signal = JSON.parse(message);
	// signal = {type, payload}
}

CommunicationServer.prototype.sendICECandidate = function(IceCandidate){

}

CommunicationServer.prototype.recieveICECandidate = function(IceCandidate){
	this.peerConnection.addIceCandidate(IceCandidate).then().catch();
}

CommunicationServer.prototype.sendDescription = function(localDescription){

}

CommunicationServer.prototype.recieveDescription = function(remoteDescription){
	this.peerConnection.setRemoteDescription(remoteDescription).then().catch();
}

function createPeerConnection(server){
	var peerConnection = new RTCPeerConnection(peerConnectionConfig);
	server.peerConnection = peerConnection;
	peerConnection.onicecandidate = server.sendICECandidate;
	return peerConnection;
}

function sendCall(){ //PC2
	var server = new CommunicationServer();
	var peerConnection = createPeerConnection(server);
	peerConnection.onaddstream = setStreamDisplay;
	//Await offer
	//Recieve remoteDescription
	peerConnection.setRemoteDescription( ... );
	peerConnection.createAnswer( ... );
	peerConnection.setLocalDescription( ... );
}

function awaitCall(){ //PC1
	var server = new CommunicationServer();
	var peerConnection = createPeerConnection(server);
	peerConnection.addStream( ... );
	peerConnection.createOffer().then( createOfferSuccess.bind(peerConnection) ).catch( createOfferError );
	//Await remote description
	peerConnection.setRemoteDescription( ... );
}

function setStreamDisplay(stream){
	console.log("TODO: SET STREAM TO DISPLAY");
}

function createOfferSuccess(description){
	this.setLocalDescription(description).then( setLocalDescriptionSuccess ).catch( setLocalDescriptionError );
}

function setLocalDescriptionSuccess(){ console.log("Local description set."); }

function createOfferError(error){ console.log(error); }
function setLocalDescriptionError(error){ console.log(error); }