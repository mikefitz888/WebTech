"use strict";
//Explore Express middleware

var sjcl = require("sjcl");

var fs = require('fs'); //filesystem
var https = require('https');
var express = require('express');
var session = require('express-session');

var path = require("path");
var bodyParser = require("body-parser");
var dot = require('dot');

dot.templateSettings.strip = false;
dot.process({path: "./views"});

var output = new Object();
var db = require("./DBWrapper");

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
var auth = (req, res, next) => {
    if (req.session && req.session.auth == true) {
        return next();
    } else {
        return res.sendStatus(401);
    }
};

var sessionShare = (req, res, next) => {
    console.log("sharingSession");
    res.locals.session = req.session;
    next();
}

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
        setHeaders: (res, path, stat) => {
            res.set('Content-Type', MIME_type);
            generalHeaders(res, path, stat);
        }
    };
};

//Enable static access to asset files
app.use('/assets/images', express.static( path.join(__dirname, 'public/assets/images'), options('image/png') ));
app.use('/assets/css', express.static( path.join(__dirname, 'public/assets/css'), options('text/css') ));
app.use('/assets/js', express.static( path.join(__dirname, 'public/assets/js'), options('application/javascript') ));

app.use('/assets/fonts/FontAwesome.otf', express.static( path.join(__dirname, 'public/assets/fonts/FontAwesome.otf'), options('application/x-font-opentype') ));
app.use('/assets/fonts/fontawesome-webfont.eot', express.static( path.join(__dirname, 'public/assets/fonts/fontawesome-webfont.eot'), options('application/vnd.ms-fontobject') ));
app.use('/assets/fonts/fontawesome-webfont.svg', express.static( path.join(__dirname, 'public/assets/fonts/fontawesome-webfont.svg'), options('image/svg+xml') ));
app.use('/assets/fonts/fontawesome-webfont.ttf', express.static( path.join(__dirname, 'public/assets/fonts/fontawesome-webfont.ttf'), options('application/x-font-truetype') ));
app.use('/assets/fonts/fontawesome-webfont.woff', express.static( path.join(__dirname, 'public/assets/fonts/fontawesome-webfont.woff'), options('application/font-woff') ));
app.use('/assets/fonts/fontawesome-webfont.woff2', express.static( path.join(__dirname, 'public/assets/fonts/fontawesome-webfont.woff2'), options('application/font-woff2') ));

/* MIME types for font-awesome icons
    .eot - application/vnd.ms-fontobject
    .woff - application/font-woff
    .woff2 - application/font-woff2
    .ttf - application/x-font-truetype
    .svg - image/svg+xml
    .otf - application/x-font-opentype
*/

/*
    Middleware
*/
let UserEventHandlers = new Object();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Template engine for controlling variable content in webpages. Usage: res.render('name', {title:'blah', message:'blah', ...});
app.engine('js', (filePath, options, callback) => {
    var header = require('./views/header');
    var render = require(filePath.substring(0, filePath.length - 3));

    var output = header({auth: options.session.auth, authh: options.session.authh, authu: options.session.authu, username: options.session.username || "Anonymous", name: options.session.name || "Anonymous", page: options.page}) + render(options);
    console.log(UserEventHandlers);
    return callback(null, output);
});

app.set('views', './views'); //Specify directory containing view templates
app.set('view engine', 'js');

//Take care of routing
app.get('/', sessionShare, (req, res) => {
    //req.session.auth = true;
    //req.session.username = "admin";
    //req.session.name = "admin";
    console.log(req.session);
    res.render('index', {target: "/get", session: req.session, auth: req.session.auth, authh: req.session.authh, authu: req.session.authu, page:'home'});
});

app.get('/find', (req, res) => {
    //res.send('/.*fly$/')
    //res.sendFile('base.html', options);
    //req.session.auth = true;
    //req.session.username = "admin";
    //req.session.name = "admin";
    //console.log(req.session);
    res.render('base', {target: "/get", session: req.session, page:'find'});
});

app.get('/give', (req, res) => {
    //res.send('/.*fly$/')
    //res.sendFile('base.html', options);
    //req.session.auth = true;
    //req.session.username = "helper";
    //req.session.name = "helper";
    var users = [];
    for(var key in UserEventHandlers){
        if(UserEventHandlers[key].help_request) users.push(UserEventHandlers[key]);
    }
    console.log("Users");
    console.log(users);
    res.render('aid', {target: "/aid", session: req.session, help:users, count: users.length, page:'give'});
});

app.post('/login', (req, res) => {
    console.log(req.session);
    db.validate(req.body.username, req.body.password).then(role => {
        req.session.auth = true;
        req.session.authh = role != 1 && role > 0;
        req.session.authu = role != 2 && role > 0;
        req.session.username = req.body.username;
        db.getName(req.body.username.toLowerCase()).then(name =>
        {
            //console.log('fine');
            //console.log(name);
            req.session.name = name;
            res.send("success");
        }).catch(error =>
        {
            req.session.name = req.session.username;
            //console.log('error'); console.log(req.session.username);
            res.send("success");
        });
    }).catch((error)=>{
        res.send(error);
    });
});

app.post('/register', (req, res) => {
    if (req.body.username == "" || req.body.name == ""
     || (req.body.role != "user"
     && (req.body.bank_details == "" || req.body.sort_code == ""))) {
        res.send("field fault");
        return;
    }
    if (req.body.password.length < 10) {
        res.send("password fault");
        return;
    }
    if (req.body.password != req.body.confirm_password)
    {
        res.send("match fault");
        return;
    }
    else db.register(req.body).then(()=>{
        req.session.auth = true;
        req.session.authh = req.body.role != "user";
        req.session.authu = req.body.role != "helper";
        req.session.username = req.body.username;
        req.session.name = req.body.given_name != "" ? req.body.given_name : req.body.name;
        res.send("success");
    }).catch((error)=>{
        res.send(error);
    });
});

app.get('/requests', (req, res) => {
    console.log(output);
    res.send("check log");
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.get('/dbsetup', (req, res) => {
    //db.serialize(function(){
        //db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username VARCHAR(10), password VARCHAR(10))");
        //db.run("INSERT INTO users (username, password) VALUES ('admin', 'salty')");
    //});
    res.send("success");
});

var options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt'),
    requestCert: false,
    rejectUnauthorized: false
};

var server = https.createServer(options, app).listen(443, '0.0.0.0', () => {
    console.log("Server started at port 443");
});

require('./signalling')(server, sessionParser, UserEventHandlers);
