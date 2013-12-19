var restify = require('restify'),
    logger = require('log4js').getLogger();

function APIServer(backend) {
  this.server = restify.createServer();
  this.backend = backend;

  this.server.get("/lookup/:ip", this.handlers.doLookup.bind(this));
  this.server.get("/lookup/:host/reverse", this.handlers.doReverseLookup.bind(this));
  this.server.put("/lookup/:host", this.handlers.maintainLookup.bind(this));
  this.server.del("/lookup/:host", this.handlers.deleteLookup.bind(this));
}

APIServer.prototype.serve = function(port) {
  this.server.listen(port, function() {
    logger.info("API Server listening in port: " + port);
  });  
}

APIServer.prototype.handlers = {
  notImplementedYet: function(req, res, next) {
    logger.debug("Request: " + req);
    return next(new restify.InternalError("Not implemented yet"));
  },

  doLookup: function(req, res, next) {
    return next(this.handlers.notImplementedYet(req, res, next));
  },

  doReverseLookup: function(req, res, next) {
    return next(this.handlers.notImplementedYet(req, res, next));
  },

  maintainLookup: function(req, res, next) {
    return next(this.handlers.notImplementedYet(req, res, next));
  },

  deleteLookup: function(req, res, next) {
    return next(this.handlers.notImplementedYet(req, res, next));
  }
}

module.exports = APIServer;