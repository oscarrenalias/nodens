var assert = require('assert'),
	Backend = require('../lib/backend.js'),
	config = {	// custom store configuration
		dbPath: './test/db',
		collName: 'lookups'
	},
	store = new Backend(config);

var testLookup = {	// test lookup data
	address: "1.2.3.4",
	name: "www.test.com",
	TTL: "10",
    expires: "3600",
	type: 1
} 	

var testLookup2 = {
	address: "1.2.3.5",
	name: "www.test.com",
	TTL: "10",
    expires: "3600",
	type: 1
}

// Helper function to force an error
function failed(err) {
	console.log("Promise failed with error: " + err);
}

module.exports = {
	testUpdateAndLookup: function(test) {
		test.expect(1);

		store.updateLookup(testLookup).then(function(item) {
			return(store.doLookup('www.test.com'));
		}).then(function(result) {;
			test.equal(result[0].address, testLookup.address);
		}).fail(failed).finally(test.done);
	},

	testDoReverseLookup: function(test) {
		test.expect(1);

		store.doReverseLookup('1.2.3.4').then(function(result) {
			test.equal(result.host, testLookup.host)
		}).fail(failed).finally(test.done);
	},

	testDeleteLookup: function(test) {
		test.expect(1);

		store.deleteLookup(testLookup.name).then(function(item) {
			return(store.doLookup('www.test.com'));
		}).then(function(result) {
            // null indicates that it wasn't found
			test.equal(result[0], null);
		}).fail(failed).finally(test.done);
	},

	testMultipleAddressesPerName: function(test) {
		test.expect(1);
		store.updateLookup(testLookup2).then(function(item) {
			return(store.doLookup('www.test.com'));
		}).then(function(result) {
			test.equal(result.length, 2);
		}).fail(failed).finally(test.done);
	}
}