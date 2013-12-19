var http = require('http'),
	logger = require('log4js').getLogger();

function APIServer() {
	this.server = http.createServer(function(request,response){    
	    response.writeHeader(200, {"Content-Type": "text/plain"});  
	    response.write("Hello World");  
	    response.end(); 
	})
}

APIServer.prototype.serve = function(port) {
	this.server.listen(port);
	logger.info("API Server listening in port: " + port);
}

module.exports = APIServer;