var DNSClient = require("../../lib/dnsclient"),
    googleDNS = { address: '8.8.8.8', port: 53, type: 'udp' },
    logger = require('log4js').getLogger('net.renalias.nodens.dns.client.test')
    client = new DNSClient(googleDNS);

module.exports = {
    "Query www.google.com": function(test) {
        test.expect(1);

        client.resolve({name: 'www.google.com', type: 'A' }).then(function(response) {
            logger.debug(JSON.stringify(response));
            test.ok(response != null);
        }).fail(function(err) {
            logger.error(err);
            test.ok(false);
        }).finally(test.done);
    }
}