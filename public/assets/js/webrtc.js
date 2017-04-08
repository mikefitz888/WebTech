var localVideo;
var remoteVideo;
var peerConnection;
var uuid;

var peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
};

function pageReady() {
    uuid = uuid();

    //localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    serverConnection = new WebSocket('wss://' + window.location.hostname + ':3000');
    serverConnection.onmessage = gotMessageFromServer;

    var constraints = {
        video: true,
        audio: false,
    };

    if(navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(errorHandler);
    } else {
        alert('Your browser does not support getUserMedia API');
    }
    

}

function recieve(){
    serverConnection.send(JSON.stringify({type: "request_communication", message: "admin"}));
}

function getUserMediaSuccess(stream) {
    localStream = stream;
    //localVideo.src = window.URL.createObjectURL(stream);
}

function start(isCaller) {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;
    

    if(isCaller) {
        remoteVideo.src = window.URL.createObjectURL(localStream);
        peerConnection.addStream(localStream);
        peerConnection.createOffer().then(createdDescription).catch(errorHandler);
    }
}

function gotMessageFromServer(message) {
    if(!peerConnection) start(false);
    console.log(message);
    var signal = JSON.parse(message.data);
    console.log(signal);

    var Description = JSON.parse(signal.SessionDescription);
    console.log(Description);
    //return;

    

    peerConnection.setRemoteDescription(new RTCSessionDescription( Description.sdp )).then(function() {
        // Only create answers in response to offers
        if(Description.sdp.type == 'offer') {
            console.log(Description.sdp);
            peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
        }
    }).catch(errorHandler);

    signal.IceCandidates.forEach(function(candidate){
        console.log(candidate);
        peerConnection.addIceCandidate(new RTCIceCandidate( JSON.parse(candidate).ice )).catch(function(e){
            console.log(69);
            errorHandler(e);
        });
    });
}

function gotIceCandidate(event) {
    if(event.candidate != null) {
        console.log("gotIceCandidate");
        serverConnection.send(JSON.stringify({
            type: "ice_candidate",
            message: JSON.stringify({'ice': event.candidate, 'uuid': uuid})
        }));
    }
}

function createdDescription(description) {
    console.log('got description');

    peerConnection.setLocalDescription(description).then(function() {
        serverConnection.send(JSON.stringify({
            type: "session_description",
            message: JSON.stringify({'sdp': peerConnection.localDescription, 'uuid': uuid})
        }));
    }).catch(errorHandler);
}

function gotRemoteStream(event) {
    console.log('got remote stream');
    remoteVideo.src = window.URL.createObjectURL(event.stream);
    console.log(remoteVideo.src);
}

function errorHandler(error) {
    console.log(error);
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
