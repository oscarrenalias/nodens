var assert = require('assert'),
	Backend = require('../lib/backend.js'),
	_ = require('underscore'),
	config = {	// custom store configuration
		dbPath: './test/db',
		// Poor man's random collection name generator
		collName: _.random(1233918319312).toString()
	},
	store = new Backend(config);

var testLookups = [
	{	// test lookup data
		address: "1.2.3.4",
		name: "www.test.com",
		TTL: "10",
	    expires: "3600",
		type: 1
	},
	{
		address: "1.2.3.5",
		name: "www.test.com",
		TTL: "10",
	    expires: "3600",
		type: 1
	},
	{
		address: '1.2.3.6',
		name: 'www.test1.com',
		TTL: '10',
		expires: '3600',
		type: 1
	}
]
		
// Helper function to force an error
function failed(err) {
	console.log("Promise failed with error: " + err);
}

module.exports = {
	"Test update and lookup": function(test) {
		test.expect(1);
		store.updateLookup(testLookups[0]).then(function(item) {
			return(store.doLookup('www.test.com'));
		}).then(function(result) {;
			test.equal(result[0].address, testLookups[0].address);
		}).fail(failed).finally(test.done);
	},

	"Test a reverse lookup": function(test) {
		test.expect(1);
		store.doReverseLookup('1.2.3.4').then(function(result) {
			test.equal(result.host, testLookups[0].host)
		}).fail(failed).finally(test.done);
	},

	"Test a host with multiple addresses for a single name record": function(test) {
		test.expect(1);
		store.updateLookup(testLookups[1]).then(function(item) {
			return(store.doLookup('www.test.com'));
		}).then(function(result) {			
			test.equal(result.length, 2);
		}).fail(failed).finally(test.done);
	},
	
	"Test deletion based on address": function(test) {
		test.expect(1);
		store.deleteAddress(testLookups[1].address).then(function() {
			return(store.doLookup('www.test.com'))
		}).then(function(result) {
			test.equal(result.length, 1);
		}).fail(failed).finally(test.done)
	},
	
	"Test deletion based on name": function(test) {
		test.expect(1);

		store.deleteName(testLookups[0].name).then(function(item) {
			return(store.doLookup('www.test.com'));
		}).then(function(result) {
			// there should be none left
			test.equal(result.length, 0);
		}).fail(failed).finally(test.done);
	}
}