//app.js//

//Load node_modules
var express = require('express'),
    connect = require('connect'),
    http = require('http'),
    path = require('path'),
    //Load SSL and filesystem modules for testing HTTPS
    https = require('https'),
    fs = require('fs'),
    //Initialize Express
    app = express();

//
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger());
app.use(connect.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: "shhhhhhhhh!"}));
app.use(app.router);
//Use our custom error handler
app.use(errorHandler);

//Output 'pretty' html
app.locals.pretty = true;

//Set up certificate for SSL
var options = {
    key: fs.readFileSync('public/certs/cert.pem'),
    cert: fs.readFileSync('public/certs/cert.pem')
};

//Create a server object
//http(app)
//https(options, app)
var server = http.createServer(app);
console.log('Node server started on port %s', process.env.PORT);

//
var io = require('socket.io').listen(server);
console.log('Setting up socket.io on %s', process.env.IP);

//
io.on('connection', function(socket){
    var ep = socket.handshake.address;
    socket.on('message', function(data){
    //Broadcast sends data to everyone but the sender.
    socket.broadcast.emit('server_message', ep.address + data);
    //Emit sends only socket. Combine both to send to everyone.
    socket.emit('server_message', 'You' + data);
  });
    socket.on('disconnect', function(){
    //socket.emit('server_message', 'Client Disconnected.');
    socket.broadcast.emit('server_message', 'Client Disconnected.');
  });
    socket.on('global', function() {
    socket.emit('server_message', 'You Connected with IP: ' + ep.address);
    socket.broadcast.emit('server_message', 'Client Connected with IP: ' + ep.address);
    })
});

server.listen(process.env.PORT, process.env.IP);

//
app.get('/', function(req, res){
    //
    res.render('index.jade', {
        // 
        title : 'Welcome to Aquaria',  
    });
});

//
app.get('/socket', function(req, res){
    //
    res.render('socket.jade', {
        // 
        title : 'socket.io // Take it for a spin',
        socket : 'active'
    });
});

//
app.get('/status', function(req, res){
    //
    res.render('status.jade', {
        // 
        title : 'Status // Just testing for now',
        socket : 'active'
    });
});

app.get('/500', function(req, res){
   throw new NewError(); 
});

app.get('/*', function(req, res) {
   throw new NotFound(); 
});

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