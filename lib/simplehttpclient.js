/**
 * Wrapper around the Q and Q-IO HTTP functionality that implements some shorthand methods
 * to make dealing with GET and POST requests easier
 */

// TODO: move this to its own little module
var Q = require("q"),
    logger = require("log4js").getLogger("net.renalias.http.qclient");

function SimpleHttpClient() {
    this.http = require("q-io/http");
}

SimpleHttpClient.prototype.get = function(url) {
    return(this.http.read(url));
};

SimpleHttpClient.prototype.getAsJson = function(url) {
    return(this.get(url).then(function(body) {
        return(JSON.parse(body));
    }));
};

SimpleHttpClient.prototype.postAsJson = function(url, body) {
    return(this.post(
        url,
        JSON.stringify(body),
        { "Content-Type": "application/json" }
    ).then(function(body) {
        return(JSON.parse(body));
    }));
};

SimpleHttpClient.prototype.putAsJson = function(url, body) {
    return(this.put(
        url,
        JSON.stringify(body),
        { "Content-Type": "application/json" }
    ).then(function(body) {
        return(JSON.parse(body));
    }));
};

SimpleHttpClient.prototype.deleteAsJson = function(url) {
    return(this.delete(url).then(function(body) {
        return(JSON.parse(body));
    }));
}

SimpleHttpClient.prototype.post = function(url, body, headers) {
    var request = {
        url: url,
        method: "POST",
        headers: headers,
        body: [ body ]
    };

    return _doRequest(this.http, request);
};

SimpleHttpClient.prototype.delete = function(url) {
    var request = {
        url: url,
        method: "DELETE",
        body: [ "" ],
        headers: {}
    };

    return _doRequest(this.http, request);
}

SimpleHttpClient.prototype.put = function(url, body, headers) {
    var request = {
        url: url,
        method: "PUT",
        headers: headers,
        body: [ body ]
    };

    return _doRequest(this.http, request);
};

// Helper method to handle HTTP calls
function _doRequest(http, request) {
    logger.debug("Sending request: " + JSON.stringify(request));

    return(Q.when(http.request(request), function (response) {
        if (response.status !== 200){
            var error = new Error("HTTP request failed with code " + response.status);
            error.response = response;
            throw error;
        }
        return Q.post(response.body, 'read', []);
    }));
}

module.exports = SimpleHttpClient;