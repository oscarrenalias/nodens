//
// Integration tests for the DNS server
//
var DNSServer = require("../../lib/dns"),
    Q = require("q"),
    DNSClient = require('../../lib/dnsclient'),
    testDnsPort = 15353,
    dnsClient = new DNSClient({ address: '127.0.0.1', port: testDnsPort, type: 'udp' }),
    logger = require('log4js').getLogger('net.renalias.nodens.tests.api'),
    dns = require('native-dns'),
    config = {  // custom store configuration
        dbPath: './test/db',
        collName: 'dns_integration'
    },
    Backend = require('../../lib/backend.js'),
    store = new Backend(config),
    dnsServer = new DNSServer(store);

var dataPromises = [
    function() { return(store.updateLookup({name: 'www.test.com', address: '1.2.3.4', ttl: 10, type: 1 })) },
    function() { return(store.updateLookup({name: 'www.test1.com', address: '1.2.3.5', ttl: 10, type: 1 })) },
    function() { return(store.updateLookup({name: 'www.test1.com', address: '1.2.3.6', ttl: 10, type: 1 })) }
];
// Some promise magic - get all data added, in sequence
var testData = dataPromises.reduce(Q.when, Q());

// Start the test DNS server
dnsServer.serve(testDnsPort);

module.exports = {
    // tests depend on the completion of the promise that inserts the data to storage... otherwise
    // thy'll fail because they try to run themselves before data is inserted
    // TODO: this is currently not working
    "Simple query, existing lookup": function(test) {
        test.expect(1);
        testData.then(function() {
            return dnsClient.resolve('www.test.com')
        }).then(function(response) {
            test.equals('1.2.3.4', response[0].address);
        }).finally(test.done);            
    },

    "Query for a host with two IP addresses": function(test) {
        test.expect(1);
        testData.then(function() {
            return(dnsClient.resolve('www.test1.com'));
        }).then(function(response) {
            test.equals(response.length, 2); 
        }).finally(test.done);
    }
}