//Explore Express middleware

var fs = require('fs'); //filesystem
var express = require('express');

var app = express();

//Template engine for controlling variable content in webpages. Usage: res.render('name', {title:'blah', message:'blah', ...}); 
//2nd arg recieved in options
app.engine('html', function(filePath, options, callback){
	fs.readFile(filePath, function(err, content){
		var rendered = content.toString();
		//Use regex or whatever to change rendered content
		var variables = new RegExp('{{(.*)}}', 'g');
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

//Options for res.sendFile, diabled atm
var options = {
	root: __dirname + '/public/',
	dotfiles: 'deny',
	headers: {
		'x-timestamp': Date.now(),
		'x-sent': true
	}
};

app.get('/', function (req, res) {
  //res.send('/.*fly$/')
  //res.sendFile('base.html', options);
  res.render('base', {title: 'Single Page Webapp'});
})

app.listen(8080, function(){
	console.log('Server listening on port 8080.');
});