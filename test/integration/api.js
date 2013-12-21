//
// Integration tests for the REST API
//
var HttpClient = require('../../lib/simplehttpclient.js'),
    client = new HttpClient(),
    Backend = require('../../lib/backend.js'),
    config = {	// custom store configuration
        dbPath: './test/db',
        collName: 'api_integration'
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
var requests = {
    simple: {   // basic test request
        address: "1.2.3.4",
        name: "www.test.com",
        ttl: "10",
        expires: "3600",
        type: "A"
    }
}

// Helper function to force an error
function failed(err) {
    //console.log("Promise failed with error: " + err);
    logger.error(err);
}

module.exports = {
    "Insert a lookup": function(test) {
        test.expect(1);
        client.putAsJson(testUrl + "/lookup", requests.simple).then(function(result) {
            test.ok(result != null)
        }).fail(failed).finally(test.done);
    },

    "Query the previous lookup": function(test) {
        test.expect(1);
        client.getAsJson(testUrl + "/lookup/" + requests.simple.name).then(function(result) {
            test.equals(result[0].name, requests.simple.name);
        }).fail(failed).finally(test.done);
    },

    "Delete a lookup": function(test) {
        test.expect(1);
        client.delete(testUrl + "/lookup/" + requests.simple.name).then(function(result) {
            // it's good enough if something comes back
            test.ok(true);
        }).fail(failed).finally(test.done);
    },

    "Query the deleted lookup": function(test) {
        test.expect(1);
        client.getAsJson(testUrl + "/lookup/" + requests.simple.name).then(function(result) {
            // this shouldn't happen
            test.ok(false);
        }).fail(function(err) {
            // a failure is what we want
            test.ok(true);
        }).finally(test.done);
    },

    // this probably isn't a massively good idea, but I can't get test groups to work (if they did
    // we could set up a single tearDown method for the whole group)
    "Tear down": function(test) {
        apiServer.close();
        test.done();
    }
}

