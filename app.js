var DNSServer = require("./lib/dns"),
    APIServer = require("./lib/api"),
    BackendStorage = require('./lib/backend'),
	config = {	// TODO: move me to real configuration!
		storage: {
			dbPath: '../db',
			collName: 'lookups'
		}
	}
    backend = new BackendStorage(config.storage),
    dnsServer = new DNSServer(backend),
    apiServer = new APIServer(backend),
    dnsPort = 53,
    apiPort = 8053;

dnsServer.serve(dnsPort);
apiServer.serve(apiPort);