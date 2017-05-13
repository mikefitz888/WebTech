(function(){function base(it
/**/) {
var out='<div id="content_container">\r\n\t\t\t<div id="render_video">\r\n\t\t\t\t<video id="remoteVideo" controls autoplay style="width: 100%;height:100%;background-repeat: no-repeat;background-size: 100%;background-image: url(https://lh5.googleusercontent.com/6U-gmL_hG9bbquDZdW_ajiA-1bgkfSlHOkzR24aigkyPQzXWXNoRNfyLjXS3rqV92iwq395JSQ=s640-h400-e365-rw);"></video>\r\n\t\t\t</div>\r\n\t\t\t<div id="side_panel_right">\r\n\t\t\t\t<input type="button" onclick="awaitCall()" value="Start Call" />\r\n\t\t\t\t<span class="info-panel-sub active">\r\n\t\t\t\t\t<h2><i class="fa fa-globe" aria-hidden="true"></i>Overview</h2>\r\n\t\t\t\t\t<p>\r\n\t\t\t\t\t\t<span class="info-section">\r\n\t\t\t\t\t\t\t<span class="info-title">Screen #1</span>\r\n\t\t\t\t\t\t\t<span class="info-element">\r\n\t\t\t\t\t\t\t\t<span class="info-name">Screen Width</span>\r\n\t\t\t\t\t\t\t\t<span class="info-entry">1920px</span>\r\n\t\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t\t<span class="info-element">\r\n\t\t\t\t\t\t\t\t<span class="info-name">Screen Height</span>\r\n\t\t\t\t\t\t\t\t<span class="info-entry">1080px</span>\r\n\t\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t<span class="info-section">\r\n\t\t\t\t\t\t\t<span class="info-title">Screen #2</span>\r\n\t\t\t\t\t\t\t<span class="info-element">\r\n\t\t\t\t\t\t\t\t<span class="info-name">Screen Width</span>\r\n\t\t\t\t\t\t\t\t<span class="info-entry">1920px</span>\r\n\t\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t\t<span class="info-element">\r\n\t\t\t\t\t\t\t\t<span class="info-name">Screen Height</span>\r\n\t\t\t\t\t\t\t\t<span class="info-entry">1080px</span>\r\n\t\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t</span>\r\n\t\t\t\t\t</p>\r\n\t\t\t\t</span>\r\n\t\t\t\t<span class="info-panel-sub">\r\n\t\t\t\t\t<h2><i class="fa fa-television" aria-hidden="true"></i>GPU Information</h2>\r\n\t\t\t\t\t<p>...</p>\r\n\t\t\t\t</span>\r\n\t\t\t\t<span class="info-panel-sub">\r\n\t\t\t\t\t<h2><i class="fa fa-tachometer" aria-hidden="true"></i>CPU Information</h2>\r\n\t\t\t\t\t<p>...</p>\r\n\t\t\t\t</span>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<script type="text/javascript">\r\n\t\t/*var localVideo;\r\n\t\tvar remoteVideo;\r\n\t\tvar peerConnection;\r\n\t\twindow.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;\r\n\t\twindow.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;\r\n\t\twindow.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;\r\n\t\tvar peerConnectionConfig = {\'iceServers\': [{\'url\': \'stun:stun.services.mozilla.com\'}, {\'url\': \'stun:stun.l.google.com:19302\'}]};\r\n\t\t\r\n\t\tfunction start(isCaller){\r\n\t\t\tpeerConnection = new RTCPeerConnection(peerConnectionConfig);\r\n\t\t    peerConnection.onicecandidate = gotIceCandidate;\r\n\t\t    peerConnection.onaddstream = gotRemoteStream;\r\n\t\t    peerConnection.addStream(localStream);\r\n\r\n\t\t    if(isCaller) {\r\n\t\t        peerConnection.createOffer(gotDescription, createOfferError);\r\n\t\t    }\r\n\t\t}\r\n\r\n\t\tfunction gotDescription(description) {\r\n\t\t    console.log(\'got description\');\r\n\t\t    peerConnection.setLocalDescription(description, function () {\r\n\t\t        serverConnection.send(JSON.stringify({\'sdp\': description}));\r\n\t\t    }, function() {console.log(\'set description error\')});\r\n\t\t}\r\n\r\n\t\tfunction gotIceCandidate(event) {\r\n\t\t    if(event.candidate != null) {\r\n\t\t        serverConnection.send(JSON.stringify({\'ice\': event.candidate}));\r\n\t\t    }\r\n\t\t}\r\n\r\n\t\tfunction gotRemoteStream(event) {\r\n\t\t    console.log(\'got remote stream\');\r\n\t\t    remoteVideo.src = window.URL.createObjectURL(event.stream);\r\n\t\t}\r\n\r\n\t\tfunction createOfferError(error) {\r\n\t\t    console.log(error);\r\n\t\t}\r\n\r\n\t\tfunction gotMessageFromServer(message) {\r\n\t\t    if(!peerConnection) start(false);\r\n\r\n\t\t    var signal = JSON.parse(message.data);\r\n\t\t    if(signal.sdp) {\r\n\t\t        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {\r\n\t\t            if(signal.sdp.type == \'offer\') {\r\n\t\t                peerConnection.createAnswer(gotDescription, createAnswerError);\r\n\t\t            }\r\n\t\t        });\r\n\t\t    } else if(signal.ice) {\r\n\t\t        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));\r\n\t\t    }\r\n\t\t}\r\n\r\n\t\t(function(){\r\n\t\t\tserverConnection = new WebSocket(\'ws://127.0.0.1:3434\');\r\n\t\t\tvar maxTries = 0;\r\n\t\t\tfunction showChromeExtensionStatus() {\r\n\t\t\t\tif(typeof window.getChromeExtensionStatus !== \'function\') return;\r\n\t\t\t\t\r\n\t\t\t\tvar gotResponse;\r\n\t\t\t\twindow.getChromeExtensionStatus(function(status) {\r\n\t\t\t\t\tgotResponse = true;\r\n\t\t\t\t\tconsole.info(\'getChromeExtensionStatus\', status);\r\n\t\t\t\t});\r\n\t\t\t\t\r\n\t\t\t\tmaxTries++;\r\n\t\t\t\tif(maxTries > 15) return;\r\n\t\t\t\tsetTimeout(function() {\r\n\t\t\t\t\tif(!gotResponse) showChromeExtensionStatus();\r\n\t\t\t\t}, 1000);\r\n\t\t\t}\r\n\t\t\t\r\n\t\t\tshowChromeExtensionStatus();\r\n\t\t\t\r\n            // via: https://bugs.chromium.org/p/chromium/issues/detail?id=487935#c17\r\n            // you can capture screen on Android Chrome >= 55 with flag: "Experimental ScreenCapture android"\r\n            window.IsAndroidChrome = false;\r\n            try {\r\n                if (navigator.userAgent.toLowerCase().indexOf("android") > -1 && /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {\r\n                    window.IsAndroidChrome = true;\r\n                }\r\n            } catch (e) {}\r\n\r\n\t\t\tgetScreenId(function(error, sourceId, screen_constraints) {\r\n                // error    == null || \'permission-denied\' || \'not-installed\' || \'installed-disabled\' || \'not-chrome\'\r\n                // sourceId == null || \'string\' || \'firefox\'\r\n                // getUserMedia(screen_constraints, onSuccess, onFailure);\r\n\r\n                if (IsAndroidChrome) {\r\n                    screen_constraints = {\r\n                        mandatory: {\r\n                            chromeMediaSource: \'screen\'\r\n                        },\r\n                        optional: []\r\n                    };\r\n                    \r\n                    screen_constraints = {\r\n                        video: screen_constraints\r\n                    };\r\n\r\n                    error = null;\r\n                }\r\n\r\n                if(error == \'not-installed\') {\r\n                  alert(\'Please install Chrome extension. See the link below.\');\r\n                  return;\r\n                }\r\n\r\n                if(error == \'installed-disabled\') {\r\n                  alert(\'Please install or enable Chrome extension. Please check "chrome://extensions" page.\');\r\n                  return;\r\n                }\r\n\r\n                if(error == \'permission-denied\') {\r\n                  alert(\'Please make sure you are using HTTPs. Because HTTPs is required.\');\r\n                  return;\r\n                }\r\n\r\n                console.info(\'getScreenId callback \\n(error, sourceId, screen_constraints) =>\\n\', error, sourceId, screen_constraints);\r\n                //var peer = new Peer(\'someid\', {host: \'localhost\', port: 9000, path: \'/peer\', secure: true});\r\n                //console.log(peer);\r\n                //navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;\r\n                navigator.mediaDevices.getUserMedia(screen_constraints).then(function(stream){\r\n                \tdocument.querySelector(\'video\').src = URL.createObjectURL(stream);\r\n\r\n                    stream.oninactive = stream.onended = function() {\r\n                        document.querySelector(\'video\').src = null;\r\n                        //document.getElementById(\'capture-screen\').disabled = false;\r\n                    };\r\n\r\n                    //document.getElementById(\'capture-screen\').disabled = false;\r\n                }).catch(function(error){\r\n                \tconsole.error(\'getScreenId error\', error);\r\n\r\n                    alert(\'Failed to capture your screen. Please check Chrome console logs for further information.\');\r\n                });\r\n                \r\n\r\n                \r\n            });\r\n\t\t})();*/\r\n\t\t</script>';return out;
}var itself=base, _encodeHTML=(function (doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	}());if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {window.render=window.render||{};window.render['base']=itself;}}());