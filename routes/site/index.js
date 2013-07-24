//site/index.js//
var site = function(app) {
    app.get('/', function(req, res){
        res.render('index.jade', {title:'Testing Routes'});
    });
    app.get('/socket', function(req, res) {
      //Get the damn temperature
      res.render('socket.jade', {
        title : 'socket.io // Take it for a spin',
        socket : 'active'
      });
    });
    app.get('/status', function(req, res){
    res.render('status.jade', {
        title : 'Status // Just testing for now',
        socket : 'active'
        });
    });
  };


module.exports = site;