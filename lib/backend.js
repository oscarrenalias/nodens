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
	this.coll.findAndModify({name: lookup.name}, [], lookup, {upsert: true}, function(err, result) {
		if(err) 
			deferred.reject(err);
		else
			deferred.resolve(result);
	});

	return(deferred.promise);
}

Backend.prototype.deleteLookup = function(name) {
	logger.debug("Deleting lookup for host: " + name);
	var deferred = Q.defer();
	this.coll.findAndModify({name: name}, [], {}, {remove: true}, function(err, result) {
		if(err) 
			deferred.reject(err);
		else 
			deferred.resolve(result);
	});

	return(deferred.promise);
}

Backend.prototype.doLookup = function(name) {
	logger.debug("Doing lookup: hostName = " + name);
	
	var deferred = Q.defer();
	this.coll.findOne({name: name}, function(err, item) {
		if(err)
			deferred.reject(err);
		else if(item == null)
            deferred.resolve([]);
        else
            deferred.resolve([item])

	})

	return(deferred.promise);
}

Backend.prototype.doReverseLookup = function(address) {
	logger.debug("Doing reverse lookup: address = " + address);

	var deferred = Q.defer();
	this.coll.findOne({address: address}, function(err, item) {
		if(err)
			deferred.reject(err);
		else
			deferred.resolve(item);
	})

	return(deferred.promise);	
}

module.exports = Backend;