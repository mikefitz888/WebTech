//Explore Express middleware

var fs = require('fs'); //filesystem
var express = require('express');
var session = require('express-session');
var path = require("path");

var app = express();

/*
**  Security Settings
*/

app.use(session({ //Prevent targetted attacks
	secret: '59E83B2F12591BCC496A77C83DC39', //doesn't need to be kept secret, just not default
	name: 's_id'
}));
app.disable('x-powered-by'); //Prevent targetted attacks

function generalHeaders(res, path, stat){
	res.set('Content-Security-Policy', "script-src 'self'"); //Prevent cross-site scripting. Important, add urls of CDNs if used
	//res.set('Public-Key-Pins', 'pin-sha256="base64=="; max-age=expireTime; includeSubDomains'); //Enable public-key pinning, prevent man-in-middle forged cert attacks
	res.set('Cache-Control', 'no-store'); //stop caching, useful for development
	res.set('X-Content-Type-Options', 'nosniff'); //Prevent browsers inferring MIME types
	res.set('X-Frame-Options', 'DENY'); //Prevent clickjacking
	res.set('X-XSS-Protection', '1; mode=block'); //Will not render if XSS occurs
}

function options(MIME_type) { //Header options for static files
	return {
		dotfiles: "ignore",
		//etag: '...', //This should change iff content has changed to help with caching, e.g. hash of content/mod date
		setHeaders: function(res, path, stat){
			res.set('Content-Type', MIME_type);
			generalHeaders(res, path, stat);
		}
	};
};

//Enable static access to asset files
app.use('/assets/images', express.static( path.join(__dirname, 'public/assets/images'), options('image/png') ));
app.use('/assets/css', express.static( path.join(__dirname, 'public/assets/css'), options('text/css') ));
app.use('/assets/js', express.static( path.join(__dirname, 'public/assets/js'), options('application/javascript') ));

//Template engine for controlling variable content in webpages. Usage: res.render('name', {title:'blah', message:'blah', ...}); 
//2nd arg recieved in options
app.engine('html', function(filePath, options, callback){
	fs.readFile(filePath, function(err, content){
		var rendered = content.toString();
		//Replaces {{some_text}} in the html file, with options.some_text, as defined during res.render(...)
		var variables = new RegExp('{{((?:\\.|[^{}\\])*)}}', 'g');
		var output = rendered.replace(variables, function(match, capture, offset, string){
				if(options.hasOwnProperty(capture)){
					return options[capture];
				}else{
					console.error('options does not have property: ' + capture);
					return '{{ERROR: \''+capture+'\' is not defined.}}';
				}
			});
		return callback(null, output); //no changes atm
	});
});

app.set('views', './views'); //Specify directory containing view templates
app.set('view engine', 'html');

//Take care of routing
app.get('/', function (req, res) {
  //res.send('/.*fly$/')
  //res.sendFile('base.html', options);
  res.render('base', {title: 'Single Page Webapp'});
})

app.listen(8080, function(){
	console.log('Server listening on port 8080.');
});