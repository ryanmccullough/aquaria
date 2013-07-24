//api/temperature.js//
var temperature = function(app) {
    app.get('/api/temperature', function(req, res){
        res.send('Temperature:20');
    });
  };


module.exports = temperature;