var logger = require('log4js').getLogger("net.renalias.nodens.backend"),
	Q = require('q'),
	Engine = require('tingodb')();


function Backend(config) {
	this.db = new Engine.Db(config.dbPath, {});
	this.coll = this.db.collection(config.collName);
}

Backend.prototype.updateLookup = function(lookup) {
	logger.debug("Inserting lookup data: ", lookup);
	var deferred = Q.defer();
	this.coll.findAndModify({host: lookup.host}, [], lookup, {upsert: true}, function(err, result) {
		if(err) 
			deferred.reject(err);
		else
			deferred.resolve(result);
	});

	return(deferred.promise);
}

Backend.prototype.deleteLookup = function(hostName) {
	logger.debug("Deleting lookup for host: " + hostName);
	var deferred = Q.defer();
	this.coll.findAndModify({host: hostName}, [], {}, {remove: true}, function(err, result) {
		if(err) 
			deferred.reject(err);
		else 
			deferred.resolve(result);
	});

	return(deferred.promise);
}

Backend.prototype.doLookup = function(hostName) {
	logger.debug("Doing lookup: hostName = " + hostName);
	
	var deferred = Q.defer();
	this.coll.findOne({host: hostName}, function(err, item) {
		if(err)
			deferred.reject(err);
		else
			deferred.resolve(item);
	})

	return(deferred.promise);
}

Backend.prototype.doReverseLookup = function(ipAddress) {
	logger.debug("Doing reverse lookup: ipAddress = " + ipAddress);

	var deferred = Q.defer();
	this.coll.findOne({ip: ipAddress}, function(err, item) {
		if(err)
			deferred.reject(err);
		else
			deferred.resolve(item);
	})

	return(deferred.promise);	
}

module.exports = Backend;