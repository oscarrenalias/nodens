var dns = require('native-dns'),
    Q = require("q"),
    logger = require('log4js').getLogger('net.renalias.nodens.dns.client');

function DNSClient(server, options) {
    this.server = server;
    this.options = options || {timeout: 1000}
}

DNSClient.prototype.resolve = function(question) {
    var q = dns.Question(question);

    var req = dns.Request({
        question: q,
        server: this.server,
        timeout: this.options.timeout
    })

    var deferred = Q.defer();

    req.on('timeout', function() {
        var error = new Error("DNS request timed out");
        logger.error(error)
        deferred.reject(error);
    })

    req.on('message', function(err, answer) {
        // TODO: a response can contain multiple answers!
        if(err) {
            logger.error(err);
            deferred.reject(err);
        }
        else deferred.resolve(answer.answer);
    })

    req.on('end', function() {
        logger.debug("Request completed")
    })

    logger.debug("request=" + JSON.stringify(question));

    req.send();

    return(deferred.promise);
}

module.exports = DNSClient;