var dns = require('native-dns'),
    logger = require('log4js').getLogger();

function DNSServer(backend) {
  this.server = dns.createServer();
  this.backend = backend;

  this.server.on('request', this.requestHandler.bind(this));
  this.server.on('error', this.errorHandler.bind(this));
}

DNSServer.prototype.serve = function(port) {
  this.server.serve(port);  
  logger.info("DNS Server listening in port: " + port);
}

DNSServer.prototype.requestHandler = function(request, response) {
  logger.debug(request);

  /*response.answer.push(dns.A({
    name: request.question[0].name,
    address: '127.0.0.1',
    ttl: 600,
  }));
  response.answer.push(dns.A({
    name: request.question[0].name,
    address: '127.0.0.2',
    ttl: 600,
  }));
  response.additional.push(dns.A({
    name: 'hostA.example.org',
    address: '127.0.0.3',
    ttl: 600,
  }));*/

  response.answer.push(dns.A({
    name: request.question[0].name,
    address: this.backend.doLookup(request.question[0].name)
  }))

  response.send();  
}

DNSServer.prototype.errorHandler = function (err, buff, req, res) {
  logger.error(err.stack);
}

module.exports = DNSServer;