//Explore Express middleware

var fs = require('fs'); //filesystem
var https = require('https');
var express = require('express');
var session = require('express-session');

var path = require("path");
var bodyParser = require("body-parser");
var dot = require('dot');

dot.templateSettings.strip = false;
dot.process({path: "./views"});

var file = "site.db";
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

var app = express();

/*
**  Security Settings
*/

var sessionParser = session({ //Prevent targetted attacks
	secret: '59E83B2F12591BCC496A77C83DC39', //doesn't need to be kept secret, just not default
	name: 's_id',
	resave: true,
	saveUninitialized: true
});
app.use(sessionParser);
app.disable('x-powered-by'); //Prevent targetted attacks

//Custom authentication middleware
var auth = function(req, res, next){
	if(req.session && req.session.auth == true) {
		return next();
	} else {
		return res.sendStatus(401);
	}
};

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

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Template engine for controlling variable content in webpages. Usage: res.render('name', {title:'blah', message:'blah', ...}); 
//2nd arg recieved in options
/*app.engine('html', function(filePath, options, callback){
	fs.readFile(filePath, function(err, content){
		var rendered = content.toString();
		var includes = new RegExp('\\[\\[((?:\\\\.|[^\\[\\]\\\\])*)\\]\\]', 'g');
		var output = rendered.replace(includes, function(match, capture, offset, string){
			return fs.readFileSync('./views/'+capture, 'utf8');
		});

		//Replaces {{some_text}} in the html file, with options.some_text, as defined during res.render(...)
		var variables = new RegExp('{{((?:\\\\.|[^{}\\\\])*)}}', 'g');
		var output = output.replace(variables, function(match, capture, offset, string){
			if(options.hasOwnProperty(capture)){
				return options[capture];
			}else{
				console.error('options does not have property: ' + capture);
				return '{{ERROR: \''+capture+'\' is not defined.}}';
			}
		});
		return callback(null, output);
	});
});*/

app.engine('js', function(filePath, options, callback){
	var header = require('./views/header');
	var render = require(filePath.substring(0, filePath.length - 3));
	var output = header({auth: options.auth, username: "A. Sample", target: options.target}) + render(options);

	return callback(null, output);
});

app.set('views', './views'); //Specify directory containing view templates
app.set('view engine', 'js');

//Take care of routing
app.get('/', function (req, res) {
  //res.send('/.*fly$/')
  //res.sendFile('base.html', options);
  req.session.frog = "gogo";
  res.render('base', {target: "/", auth: req.session.auth});
});

app.post('/login', function(req, res){
	db.serialize(function(){
		db.get("SELECT id FROM users WHERE username = ? AND password = ?", req.body.username, req.body.password, function(err, row){
			if(row){
				req.session.auth = true;
				res.send("success"); //Successful
			}else{
				res.send("failure"); //Failure
			}
		});
	});
});

app.get('/logout', function(req, res){
	req.session.destroy();
	res.redirect("/");
});

app.get('/dbsetup', function(req, res){
	db.serialize(function(){
		//db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username VARCHAR(10), password VARCHAR(10))");
		//db.run("INSERT INTO users (username, password) VALUES ('admin', 'salty')");
	});
	res.send("success");
});

app.get('/stream', function(req, res){
	var file = path.resolve(__dirname,"movie.mp4");
	console.log(file);
    fs.stat(file, function(err, stats) {
	    if (err) {
		    if (err.code === 'ENOENT') {
		        // 404 Error if file not found
		        return res.sendStatus(404);
		    }
		    res.end(err);
		}
	    
	    var range = req.headers.range;
	    if (!range) {
	        // 416 Wrong range
	    	return res.sendStatus(416);
	    }
	    var positions = range.replace(/bytes=/, "").split("-");
	    var start = parseInt(positions[0], 10);
	    var total = stats.size;
	    var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
	    var chunksize = (end - start) + 1;

	    var maxChunk = 1024 * 1024; // 1MB at a time
		if (chunksize > maxChunk) {
		  end = start + maxChunk - 1;
		  chunksize = (end - start) + 1;
		}

		res.writeHead(206, {
			"Content-Range": "bytes " + start + "-" + end + "/" + total,
			"Accept-Ranges": "bytes",
			"Content-Length": chunksize,
			"Content-Type": "video/mp4"
		});

      	var stream = fs.createReadStream(file, { start: start, end: end, autoClose: true }).on("open", function() {
        	stream.pipe(res);
        }).on("error", function(err) {
            res.end(err);
        });
    });
});

var options = {
	key: fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.crt'),
	requestCert: false,
	rejectUnauthorized: false
};
var server = https.createServer(options, app).listen(3000, function(){
	console.log("Server started at port 3000");
});


require('./signalling')(server, sessionParser);