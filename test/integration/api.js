//
// Integration tests for the REST API
//
var HttpClient = require('../../lib/simplehttpclient.js'),
    client = new HttpClient(),
    Q = require('q'),
	_ = require('underscore'),
    Backend = require('../../lib/backend.js'),
    config = {	// custom store configuration
        dbPath: './test/db',
        collName: _.random(1213231).toString()
    },
    store = new Backend(config),
    testApiServerPort = 8383,
    APIServer = new require("../../lib/api"),
    apiServer = new APIServer(store),
    testUrl = "http://localhost:" + testApiServerPort,
    logger = require('log4js').getLogger('net.renalias.nodens.tests.api');

// start the test API server for the tests
apiServer.serve(testApiServerPort);

// test request
var requests = [
    {   // basic test request
        address: "1.2.3.4",
        name: "www.test.com",
        ttl: "10",
        expires: "3600",
        type: 1
    },
    {   // second address for the same name
        address: "1.2.3.5",
        name: "www.test1.com",
        ttl: "10",
        expires: "3600",
        type: 1
    },
    {   // second address for the same name
        address: "1.2.3.6",
        name: "www.test1.com",
        ttl: "10",
        expires: "3600",
        type: 1
    }    
]

// Helper function to force an error
function failed(err) {
    //console.log("Promise failed with error: " + err);
    logger.error(err);
}

module.exports = {
    "Insert a lookup": function(test) {
        test.expect(1);
        client.putAsJson(testUrl + "/lookup", requests[0]).then(function(result) {
            test.ok(result != null)
        }).fail(failed).finally(test.done);
    },

    "Query the previous lookup": function(test) {
        test.expect(1);
        client.getAsJson(testUrl + "/lookup/" + requests[0].name).then(function(result) {
            test.equals(result[0].name, requests[0].name);
        }).fail(failed).finally(test.done);
    },

    "Delete a host by its name": function(test) {
        test.expect(1);
        client.delete(testUrl + "/lookup/" + requests[0].name).then(function(result) {
            // it's good enough if something comes back
            test.ok(true);
        }).fail(failed).finally(test.done);
    },

    "Query the deleted host": function(test) {
        test.expect(1);
        client.getAsJson(testUrl + "/lookup/" + requests[0].name).then(function(result) {
            // this shouldn't happen
            test.ok(false);
        }).fail(function(err) {
            // a failure is what we want
            test.ok(true);
        }).finally(test.done);
    },

    "Insert and query two lookups for the same host": function(test) {
        test.expect(1);
        Q.all([
            client.putAsJson(testUrl + "/lookup", requests[1]),
            client.putAsJson(testUrl + "/lookup", requests[2])
        ]).then(function(results) {
            // check that we get two name lookups for the given host
            return(client.getAsJson(testUrl + "/lookup/" + requests[2].name));
            test.ok(true);
        }).then(function(results) {
            test.equals(2, results.length);
        }).fail(function(err) {
            test.ok(false, "Could not insert two lookups for the same host");
        }).finally(test.done);
    },
	
	'Delete a host using its address': function(test) {
		test.expect(1);
		client.delete(testUrl + '/lookup/address/' + requests[1].address).then(function(result) {
			test.ok(true);
		}).finally(test.done);
	}
}