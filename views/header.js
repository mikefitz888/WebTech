(function(){function header(it
/**/) {
var out='<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<title>Template Page</title>\n\t\t<script src="assets/js/jquery-3.1.1.min.js"></script>\n\t\t<script src="assets/js/communication.js"></script>\n\t\t<script type="text/javascript">\n\t\t//navigator.geolocation\n\t\t//var battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;\n\t\t$(function(){\n\t\t\t$("#side_panel_right .info-panel-sub").on("click", function(e){\n\t\t\t\t//Do stuff\n\t\t\t});\n\n\t\t\t$(".login_button").on("click", function(e){\n\t\t\t\t$(".login").show();\n\t\t\t});\n\n\t\t\t$("#login-form form").submit(function(e){\n\t\t\t\t$.ajax({\n\t           \t\ttype: "POST",\n\t           \t\turl: "/login",\n\t           \t\tdata: $("#login-form form").serialize(), // serializes the form\'s elements.\n\t           \t\tsuccess: function(data)\n\t           \t\t{\n\t               \t\tif(data == "success"){\n\t               \t\t\twindow.location.reload();\n\t               \t\t}else{\n\n\t               \t\t}\n\t           \t\t}\n         \t\t});\n\n\t    \t\te.preventDefault();\n\t\t\t});\n\t\t});\n\t\t</script>\n\n\t\t<link rel="stylesheet" href="assets/css/font-awesome.min.css">\n\t\t<!-- THIS STYLE BLOCK SHOULD BE LATER MOVED EXTERNALLY -->\n\t\t<style type="text/css">\n\t\t/* NOTES:\n\t\t\tThe CSS here uses some features that aren\'t compatible with all browsers. Due to the nature of\n\t\t\tour application it make sense for us to only target current Firefox and Chrome releases. Edge/IE11\n\t\t\tshould still work, or at least partial support is provided. (flex boxes)\n\t\t*/\n\t\t\t/*CSS RESET (because browsers can be inconsitent)*/\n\t\t\thtml, body, div {\n\t\t\t\tmargin:0;\n\t\t\t\tpadding:0;\n\t\t\t\tborder:0;\n\t\t\t\tfont-size: 100%;\n\t\t\t\tfont:inherit;\n\t\t\t\tvertical-align: baseline;\n\t\t\t\tline-height:1;\n\t\t\t}\n\n\t\t\thtml, body {\n\t\t\t\theight:100%;\n\t\t\t\toverflow: hidden;\n\t\t\t}\n\n\t\t\tbody {\n\t\t\t\tdisplay: flex;\n\t\t\t\tflex-flow: column;\n\t\t\t\tfont-family: "Proxima Nova","Helvetica Neue",Helvetica,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;`\n\t\t\t}\n\t\t\t/*MENU*/\n\t\t\theader {\n\t\t\t\tflex: 0 1 auto;\n\t\t\t}\n\n\t\t\tul.horizontal_menu {\n\t\t\t\tlist-style-type: none;\n\t\t\t\tmargin: 0;\n\t\t\t\tpadding: 0;\n\t\t\t\toverflow: hidden;\n\t\t\t\tbackground-color: #222;\n\t\t\t\tline-height: 25px;\n\t\t\t}\n\n\t\t\tul.horizontal_menu li {\n\t\t\t\tdisplay: inline-block;\n\t\t\t\theight: 50px;\n\t\t\t}\n\n\t\t\tul.horizontal_menu li:hover {\n\t\t\t\tborder-bottom: 4px #00a2d9 solid;\n\t\t\t}\n\n\t\t\tul.horizontal_menu li.active {\n\t\t\t\tborder-bottom: 4px #00a2d9 solid;\n\t\t\t}\n\n\t\t\tul.horizontal_menu li a {\n\t\t\t\tdisplay: inline-block;\n\t\t\t\tcolor: #fff;\n\t\t\t\ttext-align: center;\n\t\t\t\tpadding: 14px 20px;\n\t\t\t\ttext-decoration: none;\n\t\t\t}\n\n\t\t\t#top_menu {\n\t\t\t\twidth:100%;\n\t\t\t\tbackground-color: #222;\n\t\t\t\t/*height:50px;*/\n\t\t\t\tflex: 0 0 50px;\n\t\t\t}\n\n\t\t\t#top_menu ul#menu_list {\n\t\t\t\tmin-width: 500px;\n\t\t\t\theight: 100%;\n\t\t\t}\n\n\t\t\t/*CONTENT*/\n\t\t\t#content_container, #top_menu {\n\t\t\t\tdisplay: flex;\n\t\t\t\tflex-flow: row;\n\t\t\t}\n\n\t\t\t#content_container {\n\t\t\t\tflex: 1 1 auto;\n\t\t\t}\n\n\t\t\t#top_menu .settings, #side_panel_right {\n\t\t\t\tflex: 1 1 200px;\n\t\t\t}\n\n\t\t\t#menu_list, #render_video {\n\t\t\t\tflex: 1 1 70%;\n\t\t\t}\n\n\t\t\t/*FOOTER*/\n\t\t\tfooter {\n\t\t\t\tdisplay: none;\n\t\t\t\tflex: 0 1 auto;\n\t\t\t\ttext-align: center;\n\t\t\t\tbackground: #444;\n\t\t\t}\n\n\t\t\t/*VIDEO AREA*/\n\t\t\t#render_video {\n\t\t\t\tbackground-color: #000;\n\t\t\t}\n\n\t\t\t/* CSS3 Animations */\n\t\t\t@keyframes pulse {\n\t\t\t  0% {\n\t\t\t    color: default;\n\t\t\t  }\n\t\t\t  100% {\n\t\t\t    color: #00a2d9;\n\t\t\t  }\n\t\t\t}\n\n\t\t\t@keyframes darken {\n\t\t\t\t0% {\n\t\t\t\t\tbackground-color: default;\n\t\t\t\t}\n\t\t\t\t100% {\n\t\t\t\t\tbackground-color: #222;\n\t\t\t\t}\n\t\t\t}\n\n\t\t\t/*SIDE PANEL*/\n\t\t\t#side_panel_right {\n\t\t\t\tbackground-color: #333;\n\t\t\t\tcolor: #adadad;\n\t\t\t}\n\n\t\t\t#side_panel_right .info-panel-sub p {\n\t\t\t\tpadding-left: 12px;\n\t\t\t\tdisplay: none;\n\t\t\t}\n\n\t\t\t#side_panel_right .info-panel-sub.active p {\n\t\t\t\tdisplay: block;\n\t\t\t\tpadding: 0;\n\t\t\t\tmargin: 0;\n\t\t\t}\n\n\t\t\t#side_panel_right .info-panel-sub h2 {\n\t\t\t\tfont-weight: 300;\n\t\t\t\tfont-size: 1.5rem;\n\t\t\t\tcursor: pointer;\n\t\t\t\tmargin: 0;\n\t\t\t\tpadding: 16px 0;\n\t\t\t\tborder-bottom: 2px solid #222;\n\t\t\t}\n\n\t\t\t#side_panel_right .info-panel-sub.active h2 {\n\t\t\t\tcolor: #fff;\n\t\t\t\tborder-right: 12px solid #00a2d9;\n\t\t\t\tbackground-color: #222;\n\t\t\t}\n\n\t\t\t#side_panel_right .info-panel-sub h2 i {\n\t\t\t\tpadding: 0 10px;\n\t\t\t\twidth: 30px;\n\t\t\t\ttext-align: center;\n\t\t\t}\n\n\t\t\t#side_panel_right .info-panel-sub.active h2 i {\n\t\t\t\tcolor: #00a2d9;\n\t\t\t}\n\n\t\t\t#side_panel_right .info-panel-sub h2:hover i {\n\t\t\t\tpadding: 0 10px;\n\t\t\t\tanimation: 0.7s 1 forwards pulse;\n\t\t\t}\n\n\t\t\t#side_panel_right .info-panel-sub h2:hover {\n\t\t\t\tanimation: 0.7s 1 forwards darken;\n\t\t\t}\n\n\t\t\t/* Panel Information */\n\t\t\t.info-section {\n\t\t\t\tfont-size:13px;\n\t\t\t\tdisplay: block;\n\t\t\t\tborder-bottom: 2px solid #222;\n\t\t\t\tpadding-bottom: 6px;\n\t\t\t}\n\n\t\t\t.info-title {\n\t\t\t\tfloat:left;\n\t\t\t\tline-height: 16px;\n\t\t\t\tpadding: 1px 10px;\n\t\t\t\tmargin-bottom: 6px;\n\t\t\t\tcolor: #222;\n\t\t\t\tfont-weight: bold;\n\t\t\t\tbackground: #00a2d9;\n\t\t\t\tposition: relative;\n\t\t\t}\n\n\t\t\t.info-title:after {\n\t\t\t\tcontent: "";\n\t\t\t\tborder-top: 18px solid #00a2d9;\n\t\t\t\tborder-right: 18px solid transparent;\n\t\t\t\tposition: absolute;\n\t\t\t\tright:-18px;\n\t\t\t\ttop:0px;\n\t\t\t}\n\n\t\t\t.info-section span:nth-of-type(2) {\n\t\t\t\tclear:left;\n\t\t\t}\n\n\t\t\t.info-name {\n\t\t\t\ttext-align: right;\n\t\t\t\twidth:50%;\n\t\t\t\tdisplay: inline-block;\t\t\n\t\t\t}\n\n\t\t\t.info-name:after {\n\t\t\t\tcontent: ":";\n\t\t\t}\n\n\t\t\t.info-entry {\n\t\t\t\twidth:50%;\n\t\t\t\ttext-align: center;\n\t\t\t}\n\n\t\t\t.info-element {\n\t\t\t\tfloat:left;\n\t\t\t\twidth: 50%;\n\t\t\t}\n\t\t\t\n\t\t\t.info-section:after {\n\t\t\t\tcontent: "";\n  \t\t\t\tdisplay: table;\n  \t\t\t\tclear:both;\t\n\t\t\t}\n\n\t\t\t.settings .settings-wrapper {\n\t\t\t\tborder:1px solid #00a2d9;\n\t\t\t\tmargin:5px;\n\t\t\t\tdisplay: block;\n\t\t\t\theight: 42px;\n\t\t\t}\n\n\t\t\t.hidden {\n\t\t\t\tvisibility: hidden;\n\t\t\t\tdisplay: none;\n\t\t\t}\n\n\t\t\t#login-dark-fade {\n\t\t\t\tposition:fixed;\n\t\t\t\tleft:0;\n\t\t\t\ttop:0;\n\t\t\t\theight: 100%;\n\t\t\t\twidth: 100%;\n\t\t\t\tbackground: #000;\n\t\t\t\topacity: 0.5;\n\t\t\t\tz-index: 1;\n\t\t\t}\n\n\t\t\t#login-form {\n\t\t\t\tz-index: 2;\n\t\t\t\tposition: fixed;\n\t\t\t\twidth:400px;\n\t\t\t\tcolor: #fff;\n\t\t\t\tpadding: 20px;\n\t\t\t\tbackground: #222;\n\t\t\t\tleft: 50%;\n\t\t\t\ttop:50%;\n\t\t\t\ttransform: translate(-50%, -50%);\n\t\t\t\tborder: 1px solid #00a2d9;\n\t\t\t\tborder-radius: 10px;\n\t\t\t}\n\n\t\t\t#login-form span {\n\t\t\t\twidth:50%;\n\t\t\t\tfloat:left;\n\t\t\t}\n\n\t\t\t.login {\n\t\t\t\tdisplay: none;\n\t\t\t}\n\n\t\t\t#login-form [type="submit"]{\n\t\t\t\tmargin-top:20px;\n\t\t\t}\n\n\t\t\t.login_button {\n\t\t\t\tdisplay: block;\n\t\t\t\twidth: 100%;\n\t\t\t\theight: 100%;\n\t\t\t\tbackground: rgb(0, 162, 217) none repeat scroll 0% 0%;\n\t\t\t\tline-height: 42px;\n\t\t\t\ttext-decoration: none;\n\t\t\t\ttext-align: center;\n\t\t\t\ttext-decoration: none;\n\t\t\t\tcolor:#fff;\n\t\t\t}\n\n\t\t\t#feature {\n\t\t\t\twidth:80%;\n\t\t\t\theight: 300px;\n\t\t\t\tmin-width: 400px;\n\t\t\t\tdisplay: flex;\n\t\t\t\tmargin: 20px auto;\n\t\t\t}\n\n\t\t\t#subcontent {\n\t\t\t\twidth:100%;\n\t\t\t}\n\n\t\t\t.user-option {\n\t\t\t\ttext-align: center;\n\t\t\t\tflex: 1 1 auto;\n\t\t\t\tbackground: #222;\n\t\t\t\tcolor: #fff;\n\t\t\t\tborder: 4px solid #00a2d9;\n\t\t\t\tborder-radius: 10px;\n\t\t\t\twidth:200px;\n\t\t\t\ttext-decoration: none;\n\t\t\t\tmargin: 0 20px;\n\t\t\t\tpadding: 25px 0;\n\t\t\t}\n\n\t\t\t.user-option .fa {\n\t\t\t\tfont-size:80px;\n\t\t\t}\n\n\t\t\tbr { /*clearfix*/\n\t\t\t\tclear: both;\n\t\t\t}\n\t\t</style>\n\t\t<!--<script src="https://cdn.webrtc-experiment.com/getScreenId.js"> </script>-->\n\t</head>\n\t<body>\n\t\t<div id="login-dark-fade" class="login"></div>\n\t\t<div id="login-form" class="login">\n\t\t\t<form action="/login" method="post">\n\t\t\t\t<h3>Login</h3>\n\t\t\t\t<span class="error hidden">Incorrect username + password combination.</span>\n\t\t\t\t<span>\n\t\t\t\t\t<label for="username">Username</label><br />\n\t\t\t\t\t<input name="username" type="input" />\n\t\t\t\t</span>\n\n\t\t\t\t<span>\n\t\t\t\t\t<label for="password">Password</label><br />\n\t\t\t\t\t<input name="password" type="password" />\n\t\t\t\t</span>\n\t\t\t\t<input type="submit" value="Login" />\n\t\t\t</form>\n\t\t</div>\n\t\t<header id="top_menu">\n\t\t\t<ul class="horizontal_menu" id="menu_list">\n\t\t\t\t<li class="active"><a href="/">HOME</a></li>\n\t\t\t\t<li><a href="/find">FIND HELP</a></li>\n\t\t\t\t<li><a href="/give">GIVE HELP</a></li>\n\t\t\t</ul>\n\t\t\t<span class="settings">\n\t\t\t\t<span class="settings-wrapper">\n\t\t\t\t\t';if(it.auth){out+='\n\t\t\t\t\t'+(it.username)+'<a href="/logout">logout</a>\n\t\t\t\t\t';}else{out+='\n\t\t\t\t\t<a href="#" class="login_button">Login / Register</a>\n\t\t\t\t\t';}out+='\n\t\t\t\t</span>\n\t\t\t</span>\n\t\t</header>';return out;
}var itself=header, _encodeHTML=(function (doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	}());if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {window.render=window.render||{};window.render['header']=itself;}}());