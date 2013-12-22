//
// Integration tests for the DNS server
//
var DNSServer = require("../../lib/dns"),
    Q = require("q"),
    _ = require("underscore"),
    mockBackend = {
        doLookup: function(hostName) {
            return(Q({name: 'www.test.com', address: '1.2.3.4', ttl: 10, type: 1 }))
        }
    }
    dnsServer = new DNSServer(mockBackend),
    testDnsPort = 8765,
    logger = require('log4js').getLogger('net.renalias.nodens.tests.api'),
    server = { address: '127.0.0.1', port: testDnsPort, type: 'udp' },
    dns = require('native-dns');

// Start the test DNS server
dnsServer.serve(testDnsPort);

module.exports = {
    "Simple query, existing lookup": function(test) {
        test.expect(1);

        // set up the question and the request
        var question = dns.Question({ name: 'www.test.com', type: 1 });
        var req = dns.Request({
            question: question,
            server: server,
            timeout: 1000
        });

        req.on('message', function(err, answer) {
            _(answer.answer).each(function(a) {
                test.equals(a.address, '1.2.3.4');
                test.done();
            })
        });

        req.on('timeout', function(err) {
            test.ok(false);
            test.done();
        })

        req.send();
    }
}