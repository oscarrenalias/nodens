var dns = require('native-dns'),
    logger = require('log4js').getLogger('net.renalias.nodens.dns');

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
    logger.info(
        "question=" + JSON.stringify(req.question[0]) + ", source=" + req.address.address + ", response=TODO"
    );
}

DNSServer.prototype.requestHandler = function (request, response) {
    // TODO: a request can have many questions!
    this.backend.doLookup(request.question[0].name).then(function (lookup) {

        if(lookup) {
            response.answer.push(dns.A({
                name: lookup.host,
                address: lookup.ip,
                ttl: lookup.ttl
            }));
        }
        else {
            response.answer.push();
        }

        auditRequest(request, response);

        response.send();
    }).fail(function(err) { // promise error handler, which is different from the DNS error handler
        logger.error(err);
        response.answer.push();
        response.send();
    });
}

DNSServer.prototype.errorHandler = function (err, buff, req, res) {
    logger.error(err.stack);
}

module.exports = DNSServer;