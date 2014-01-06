var restify = require('restify'),
    logger = require('log4js').getLogger('net.renalias.nodens.api'),
    util = require('util'),
    _ = require('underscore');

function APIServer(backend, config) {
    this.server = restify.createServer();
    // some middleware
    this.server.use(restify.bodyParser());
    // custom logging middleware
    this.server.on('after', Log4jsLogger('net.renalias.nodens.api.access', {logRequestBody: true, logResponseBody: true}));

    this.backend = backend;
    this.config = _.defaults(config, {defaultExpires: 3600});

    this.server.get("/lookup/:name", this.handlers.doLookup.bind(this));
    this.server.get("/lookup/:ip/reverse", this.handlers.doReverseLookup.bind(this));
    this.server.put("/lookup", this.handlers.maintainLookup.bind(this));
    this.server.del("/lookup/:name", this.handlers.deleteName.bind(this));
	this.server.del("/lookup/address/:address", this.handlers.deleteAddress.bind(this));
}

function Log4jsLogger(loggerName, opt) {
    var logger = require('log4js').getLogger(loggerName);
    var options = opt || {logRequestBody: false, logResponsebody: false};

    var logResponseBody = function (res) {
        if (res._body instanceof restify.HttpError) {
            body = JSON.stringify(res._body.body);
        } else if (res._body instanceof Object) {
            body = JSON.stringify(res._body);
        } else {
            body = res._body;
        }

        return(body);
    };

    var logRequestBody = function(req) {
        return(JSON.stringify(req.body));
    };

    return(function (req, res, next) {
        var logLine = "host=" + req.headers.host + ", method=" + req.method + ", url=" + req.url + ", code=" + res.statusCode;

        if (options.logRequestBody) {
            logLine = logLine + ", request=" + logRequestBody(req);
        }

        // log the response body if available
        if (options.logResponseBody) {
            logLine = logLine + ", response=" + logResponseBody(res);
        }

        logger.info(logLine);
    });
}

APIServer.prototype.serve = function (port) {
    this.server.listen(port, function () {
        logger.info("API Server listening in port: " + port);
    });
};

APIServer.prototype.close = function (cb) {
    this.server.close(cb);
};

// 404 Not Found error message
function LookupNotFoundError() {
    restify.RestError.call(this, {
        restCode: 'NOT_FOUND',
        statusCode: 404,
        message: "Lookup not found",
        constructorOpt: LookupNotFoundError
    });
    this.name = 'LookupNotFoundError';
}
util.inherits(LookupNotFoundError, restify.RestError);

// Any other type of error
function ApiError() {
    restify.RestError.call(this, {
        restCode: 'API_ERROR',
        statusCode: 500,
        message: "Error processing request",
        constructorOpt: ApiError
    });
    this.name = 'ApiError';
}
util.inherits(ApiError, restify.RestError);

APIServer.prototype.handlers = {
    notImplementedYet: function (req, res, next) {
        logger.debug('Request: ' + req);
        return next(new restify.InternalError('Not implemented yet'));
    },

    doLookup: function (req, res, next) {
        var name = req.params.name;
        this.backend.doLookup(name).then(function (lookup) {
            if(lookup && lookup.length > 0) res.send(lookup);
            else res.send(new LookupNotFoundError());
        }).fail(function (err) {
            logger.error(err);
            res.send(new ApiError());
        }).finally(next);
    },

    doReverseLookup: function (req, res, next) {
        var ip = req.params.ip;
        this.backend.doReverseLookup(ip).then(function (lookup) {
            if(lookup) res.send(lookup);
            else res.send(new LookupNotFoundError());
        }).fail(function (err) {
            logger.error(err);
            res.send(new ApiError());
        }).finally(next);
    },

    maintainLookup: function (req, res, next) {
        var lookup = req.body;

        // ensure that the request has an expiration time or provide the default one if none is given
        lookup.expires = lookup.expires || this.config.defaultExpires;

        this.backend.updateLookup(lookup).then(function (item) {
            res.send('OK');
        }).fail(function (err) {
            logger.error(err);
            res.send(new ApiError());
        }).finally(next);
    },

    deleteAddress: function (req, res, next) {
        var address = req.params.address;
        this.backend.deleteAddress(address).then(function (lookup) {
            res.send('OK');
        }).fail(function (err) {
            logger.error(err);
            res.send(new LookupNotFoundError());
        }).finally(next);
    },
	
	deleteName: function(req, res, next) {
		var name = req.params.name;
		this.backend.deleteName(name).then(function(lookup) {
			res.send('OK');
		}).fail(function(err) {
			logger.error(err);
			res.send(new LookupNotFoundError());
		}).finally(next);
	}
};

module.exports = APIServer;