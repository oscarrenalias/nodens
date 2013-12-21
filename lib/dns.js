var dns = require('native-dns'),
    logger = require('log4js').getLogger('net.renalias.nodens.dns'),
    Q = require('q'),
    _ = require('underscore');

function DNSServer(backend) {
    this.server = dns.createServer();
    this.backend = backend;

    this.server.on('request', this.requestHandler.bind(this));
    this.server.on('error', this.errorHandler.bind(this));
}

DNSServer.prototype.serve = function (port) {
    this.server.serve(port);
    logger.info("DNS Server listening in port: " + port);
}

DNSServer.prototype.close = function() {
    this.server.close();
}

// maps record types to the library response types
var recordTypes = {
    "A": dns.A
}

function auditRequest(req, res) {
    var log = "source=" + req.address.address;
    _.zip(req.question, res.question).map(function(item) {
        log = log +
            ", [ question=" + JSON.stringify(item[0]) +
            ", response=" + JSON.stringify(item[1]) + " ]"
    })

    logger.info(log);
}

DNSServer.prototype.requestHandler = function (request, response) {
    var lookups =_(request.question).map(function(question) {
        return(this.backend.doLookup(question.name));
    }.bind(this));

    // multiple questions will generate multiple lookups and therefore multiple promises,
    // so we wait for all of them, check the results and provide a single response
    Q.allSettled(lookups).then(function(results) {
        _(results).each(function(result) {
            if(result.state === 'fulfilled' && result.value) {
                var lookup = result.value;
                response.answer.push(dns.A({
                    name: lookup.host,
                    address: lookup.ip,
                    ttl: lookup.ttl
                }));
            }
            else {
                // promise unfulfilled, or lookup not found in database
                var message = result.value == null ? "Lookup not found" : result.reason;
                logger.error(message);
                response.answer.push();
            }
        })
    }).finally(function() {
        auditRequest(request, response);
        response.send();
    }).fail(function(err) {
        logger.error(err);
    });
}

DNSServer.prototype.errorHandler = function (err, buff, req, res) {
    logger.error(err.stack);
}

module.exports = DNSServer;