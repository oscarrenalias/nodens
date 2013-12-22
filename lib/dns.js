var dns = require('native-dns'),
    logger = require('log4js').getLogger('net.renalias.nodens.dns'),
    Q = require('q'),
    _ = require('underscore'),
    DNSClient = require("./dnsclient")

function DNSServer(backend, opts) {
    this.opts = opts || {upstream: { enabled: false }};

    this.server = dns.createServer();
    this.backend = backend;

    if(this.opts.upstream.enabled) {
        this.dnsClient = new DNSClient(this.opts.upstream.ip);
    }

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

// TODO: this currently doesn't work
function auditRequest(req, res) {
    var log = "source=" + req.address.address;
    _.zip(req.question, res.question).map(function(item) {
        log = log +
            ", [ question=" + JSON.stringify(item[0]) +
            ", response=" + JSON.stringify(item[1]) + " ]"
    })

    logger.info(log);
}

function ResponseFactory(lookup) {
    // this dictionary maps DNS record type numbers to the specifi record
    // classes that the native-dns library uses
    var responseTypesToRecordClass = {
        1: dns['A'],
        2: dns['NS'],
        5: dns['CNAME'],
        12: dns['PTR'],
        35: dns['NAPTR'],
        16: dns['TXT'],
        15: dns['MX'],
        33: dns['SRV'],
        6: dns['SOA']
    }

    var response = {
        name: lookup.name,
        type: lookup.type,
        ttl: lookup.ttl,
        address: lookup.address || ''
    };

    return(responseTypesToRecordClass[response.type](response));
}

DNSServer.prototype.requestHandler = function (request, response) {
    var self = this;
    var lookups =_(request.question).map(function(question) {
        return(this.backend.doLookup(question.name).then(function(lookup) {
            if(lookup.length == 0) {
                // wasn't in our database, check with the upstream DNS server; since the DNS client
                // also works with promises and will return the same type of answers that our backend does,
                // we can simply return the promise and be done with it
                if(this.opts.upstream.enabled) {
                    logger.debug("Did not find name in database, checking with upstream server: " + this.opts.upstream.ip);
                    return(this.dnsClient.resolve(question));
                }
            }
            else {
                // return a static value wrapped in a promise so that we can then() it later on
                return(Q(lookup));
            }
        }.bind(this)));
    }.bind(this));

    // multiple questions will generate multiple lookups and therefore multiple promises,
    // so we wait for all of them, check the results and provide a single response
    Q.allSettled(lookups).then(function(results) {
        _(results).each(function(result) {
            // 'fulfilled' indicates that the specific promise was resolved to a value (it did not fail)
            if(result.state === 'fulfilled' && result.value) {
                _(result.value).each(function(lookup) {
                    response.answer.push(ResponseFactory(lookup));
                })
            }
            else {
                // promise unfulfilled, or lookup not found in database
                var message = result.value == null ? "Lookup not found" : result.reason;
                logger.error(message);
                response.answer.push();
            }
        })
    }).finally(function() {
        //auditRequest(request, response);
        response.send();
    }).fail(function(err) {
        logger.error(err);
    });
}

DNSServer.prototype.errorHandler = function (err, buff, req, res) {
    logger.error(err.stack);
}

module.exports = DNSServer;