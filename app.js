var DNSServer = require("./lib/dns"),
    APIServer = require("./lib/api"),
    BackendStorage = require('./lib/backend'),
    config = require("./config"),
    backend = new BackendStorage(config.storage),
    dnsServer = new DNSServer(backend, config.dns),
    apiServer = new APIServer(backend, config.api),
    dnsPort = process.env.DNSPORT || config.ports.dns,
    apiPort = process.env.APIPORT || config.ports.api;

dnsServer.serve(dnsPort);
apiServer.serve(apiPort);