//routes/index.js//
var routes = function(app) {
    var api = require('./api/index');
    var site = require('./site/index');
    api(app);
    site(app);
  };

module.exports = routes;