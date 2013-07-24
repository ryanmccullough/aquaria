//app.js//

//Load node_modules
var express = require('express'),
    routes = require('./routes/index'),   //Initiate the routes directory
    connect = require('connect'),
    http = require('http'),
    path = require('path'),
    https = require('https'),   //Load SSL module
    fs = require('fs'), //Load filesystem module
    nano = require('nano')('https://aquaria.iriscouch.com/'),   //Load Iris Couch Database
    app = express();    //Initialize Express

// Use for all environments
app.set('views', __dirname + '/views'); //Set up where our views are saved
app.set('view engine', 'jade'); //Initialize a templating engine.
app.use(express.static(path.join(__dirname, 'public')));    //Set up where static files are saved. (Publicly accessable)
app.use(express.logger('dev'));
app.use(connect.bodyParser());
app.use(express.cookieParser());
app.use(express.favicon('public/img/favicon.ico'));  //Set the favicon
app.use(app.router);    //Load the express router

if ('development' == app.get('env')) { // Development environment only
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); //Use built-in error handler
  app.locals.pretty = true; //Output 'pretty' html
  app.use(express.session({ secret: "shhhhhhhhh!"})); //Use a jank secret
  var options = {   //Set up certificate and key for SSL
    key: fs.readFileSync(__dirname + '/certs/dummycert.pem'),  //Use junk certs to protect publishing private data.
    cert: fs.readFileSync(__dirname + '/certs/dummycert.pem')  //Remember that it will warn users that this site is dangerous.
  };
  var db = nano.db.use('datalog_dev');
  console.log('Nano using database: \'datalog_dev\'');
}

if ('production' == app.get('env')) { // Production environment only
  app.use(errorHandler);    //Use custom error handler
  app.use(express.session({ secret: "8a3u9f8jnaw09jfsdnug0br98w3ua09eua8uef8hsdfu98wyf"})); //Use a SECURE secret
  var options = {   //Set up certificate and key for SSL
    key: fs.readFileSync(__dirname + '/certs/cert.pem'),  //Use real certs
    cert: fs.readFileSync(__dirname + '/certs/cert.pem')  //against publishing them.
  };
  var db = nano.db.use('datalog_pro');
  console.log('Nano using database: \'datalog_pro\'');
}

var server = http.createServer(app);    //Create a server object. Use http.createServer(app) for a plain jain http over port 80. Use https.createServer(options, app) for SSL over 443. The options argument loads the certificates
console.log('Node server started on port %s', process.env.PORT);

var io = require('socket.io').listen(server);   //Attach socket.io to the server object.
console.log('Setting up socket.io on %s', process.env.IP);

io.configure('production', function(){  //Configure the socket.io module
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1);                    // reduce logging

  io.set('transports', [    //set the transport chain
    'websocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
  ]);
});

//For development, we want to use websockets and leave logging at debug level (default)
io.configure('development', function(){
  io.set('transports', [    //set the transport chain
  //  'websocket', //This is preferred but sometimes does not work.
  'htmlfile',
  'xhr-polling',
  'jsonp-polling'
  ]);
});

//Socket.io handlers
io.on('connection', function(socket){
    var ep = socket.handshake.address.address;   //On connect, attach the address of the client to ep(endpoint).
    socket.on('message', function(data){
    socket.broadcast.emit('server_message', ep + data);     //Broadcast sends data to everyone but the sender.
    socket.emit('server_message', 'You' + data);    //Emit sends only socket. Combine both to send to everyone.
  });
    socket.on('disconnect', function(){ //On disconnect, tell everyone about it.
    socket.emit('server_message', 'Client at ' + ep + ' Disconnected.');
    socket.broadcast.emit('server_message', 'Client at ' + ep + ' Disconnected.');
  });
    //Testing functions
    socket.on('global', function() {
    socket.emit('server_message', 'You Connected with IP: ' + ep);
    socket.broadcast.emit('server_message', 'Client Connected with IP: ' + ep);
    })
});

server.listen(process.env.PORT, process.env.IP);    //Initialize node

//Load our routes object into app
routes(app);



//500 Error page
app.get('/500', function(req, res){
   throw new NewError(); 
});

//Catch all error page
app.get('/*', function(req, res) {
   throw new NotFound(); 
});

//Custom error handler functions
function NotFound(msg){ 
    this.name = 'Page Not Found';
    this.code = '404';
    this.desc = 'The page you requested could not be found, either try again or go back. Use your browser\'s Back  button to return to the previous page.';
    Error.call(this, msg);
}

function NewError(msg){
    this.name = 'Internal Server Error';
    this.code = '500';
    this.desc = 'Something went horribly wrong on our end.';
    Error.call(this, msg);
}

function errorHandler(err, req, res, next){
    if (err) {
        res.status(500);
        res.render('error.jade', {
            title : 'Error: ' + err.code + ' / ' + err.name,
            error : err
        });
        console.log('Error: ' + err.code + ' / ' + err.name);
    } else {
        next();
    }
}