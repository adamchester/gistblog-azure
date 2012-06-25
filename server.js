// 
/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();
var port = process.env.port || 3000;

var routes = {
  Posts: require('./routes/posts.js').Posts
  , About: require('./routes/about.js').About
};

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.enable("jsonp callback");
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/about', routes.About.index);
app.get('/', routes.Posts.index);

console.log("attempting to listen on port %d", port);

app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
