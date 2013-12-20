//
// Integration tests for the DNS server
//
var DNSServer = require("../../lib/dns"),
    mockBackend = {
        doLookup: function(hostName) {
            return(Q({host: 'www.test.com', ip: '1.2.3.4', ttl: 10, type: 'A' }))
        }
    }
    dnsServer = new DNSServer(mockBackend),
    testDnsPort = 5353,
    logger = require('log4js').getLogger('net.renalias.nodens.tests.api'),
    server = { address: '127.0.0.1', port: testDnsPort, type: 'udp' },
    dns = require('native-dns');

// Start the test DNS server
dnsServer.serve(testDnsPort);

module.exports = {
    "Test simple query": function(test) {
        test.expect(1);

        // set up the question and the request
        var question = dns.Question({ name: 'www.test.com', type: 'A' });
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