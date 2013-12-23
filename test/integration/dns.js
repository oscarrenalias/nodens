//
// Integration tests for the DNS server
//
var DNSServer = require("../../lib/dns"),
    Q = require("q"),
    _ = require("underscore"),
    mockBackend = {
        doLookup: function(hostName) {
            return(Q([{name: 'www.test.com', address: '1.2.3.4', ttl: 10, type: 1 }]))
        }
    },
    dnsServer = new DNSServer(mockBackend),
    DNSClient = require('../../lib/dnsclient'),
    testDnsPort = 15353,
    dnsClient = new DNSClient({ address: '127.0.0.1', port: testDnsPort, type: 'udp' }),
    logger = require('log4js').getLogger('net.renalias.nodens.tests.api'),
    dns = require('native-dns');

// Start the test DNS server
dnsServer.serve(testDnsPort);

module.exports = {
    "Simple query, existing lookup": function(test) {
        test.expect(1);
        dnsClient.resolve('www.tet.com').then(function(response) {
            test.equals('1.2.3.4', response[0].address);
        }).finally(test.done);
    }
}