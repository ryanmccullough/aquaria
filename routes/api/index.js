//api/index.js//
var api = function(app) {
    var temperature = require('./temperature');
    temperature(app);
    app.get('/api', function(req, res){
        res.render('index.jade', {title:'API INDEX'});
    });
    app.get('/api/status', function(req, res){
    res.render('status.jade', {
        title : 'Status // Just testing for now',
        socket : 'active'
        });
    });
  };


module.exports = api;