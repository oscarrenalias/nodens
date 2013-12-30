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
	
	// if the host and address match, update it; if no match was
	// found, add a new record for the same address

	// TODO: this is currently ignoring the type, which is something that is probably
	// only ok with A records...
	var query = {name: lookup.name, address: lookup.address};
	var self = this;
	this.coll.findOne(query, function(err, item) {
		// if an error, reject right away
		if(err)
			deferred.reject(err);
		
		if(item == null) {
			// not found, so we can add it
			logger.debug("Lookup was not found, adding a new one. Query = " + JSON.stringify(query));
			self.coll.insert(lookup, function(err, result) {
				if(err) deferred.reject(err);
				else deferred.resolve(result);
			})			
		}
		else {
			// a match was found, so we add a new entry
			logger.debug("Lookup was found, updating it");
			self.coll.findAndModify({name: lookup.name}, [], lookup, {upsert: true}, function(err, result) {
				if(err) deferred.reject(err);
				else deferred.resolve(result);
			});			
		}
	})

	return(deferred.promise);
}

// Handles deletions based on the given query
Backend.prototype._internalDelete = function(query) {
	var deferred = Q.defer();
	this.coll.findAndModify(query, [], {}, {remove: true}, function(err, result) {
		if(err) deferred.reject(err);
		else deferred.resolve(result);
			
	});

	return(deferred.promise);	
}

// TODO: this isn't currently removing all instances
Backend.prototype.deleteLookup = function(name) {
	logger.debug("Deleting lookup for name: " + name);
	return(this._internalDelete({name: name}));
}

// Deletes an entry based on the IP address
Backend.prototype.deleteHost = function(address) {
	logger.debug("Deleting lookup for address: " + address);
	return(this._internalDelete({address: address}));	
}

Backend.prototype.doLookup = function(name) {
	logger.debug("Doing lookup: name = " + name);
	
	var deferred = Q.defer();

	this.coll.find({name: name}).toArray(function(err, items) {
		logger.debug("items = " + JSON.stringify(items));
		if(err) deferred.reject(err);
		else if(items == null) deferred.resolve([]);
		deferred.resolve(items);
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