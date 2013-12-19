var logger = require('log4js').getLogger(),
	Q = require('q'),
	Engine = require('tingodb')();


function Backend(config) {
	this.db = new Engine.Db(config.dbPath, {});
	this.coll = this.db.collection(config.collName);
}

Backend.prototype.updateLookup = function(lookup) {
	logger.debug("Inserting lookup data: ", lookup);
	var deferred = Q.defer();
	this.coll.insert([lookup], {w:1}, function(err, result) {
		if(err) 
			deferred.reject(new Error(err));
		else
			deferred.resolve(result);
	});

	return(deferred.promise);
}

Backend.prototype.deleteLookup = function(ipAddress) {
	throw Exception("Not implemented yet");
}

Backend.prototype.doLookup = function(hostName) {
	logger.debug("Doing lookup: hostName = " + hostName);
	
	var deferred = Q.defer();
	this.coll.findOne({host: hostName}, function(err, item) {
		if(err)
			deferred.reject(new Error(err));
		else
			deferred.resolve(item);
	})

	return(deferred.promise);

	//return("1.2.3.4");
}

Backend.prototype.doReverseLookup = function(ipAddress) {
	logger.debug("Doing reverse lookup: ipAddress = " + ipAddress);

	var deferred = Q.defer();
	this.coll.findOne({ip: ipAddress}, function(err, item) {
		if(err)
			deferred.reject(new Error(err));
		else
			deferred.resolve(item);
	})

	return(deferred.promise);	
}

module.exports = Backend;