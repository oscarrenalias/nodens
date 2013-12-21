Introduction
============
Nodens is a very simple DNS server built on DNS that exposes a RESTful API that allows clients to maintain the DNS lookup data.

Current features:

- RESTful API to maintain the name database
- Basic resolution of DNS queries

Getting started
===============
Run these to get started:

```
npm install
node app.js
curl -X PUT -H "Content-Type: application/json" http://localhost:8053/lookup -d '{ "ip": "1.2.3.4", "host": "www.test.com", "ttl": "10", "expires": "3600", "type": "A" }'
dig @127.0.0.1 -p 5353 www.test.com
```

The last command should generate a response resolving "www.test.com" to "1.2.3.4".

Use cases for nodedns
=====================
NodeNS grew from the need to scratch an itch: a simple, lightweight and easy to use DNS server to support Docker environments so that Docker containers could register themselves in a DNS server as they are started, and other containers could access them using a known hostname rather than changing IP addresses.

Please note that this use case is not strictly related to Docker and can also be used in any other type of virtual machine environment.

What nodedns is not
===================
NodeNS is not (and will never try to be) a production-grade DNS server.

There currently are no plans to support multiple instances of NodeNS running in parallel and replicating their databases, as that's not needed for small, local development environments.

No security features are provided (e.g. secure API calls) either.

RESTful API
===========
The API exposes basic functionality for registering new names in the database, updating and deleting existing ones, and doing name lookups (normal lookups as well as reverse lookups).

Requests and responses will be served using the ```application/json``` content type.

Responses
---------
Unless indicated otherwise, API calls follow these conventions:

- HTTP 200 code in case of successful operations
- HTTP 404 code in case the requested could not find the requested entity, e.g. do a name lookup for a host that is not in the database.
- HTTP 500 code in all other scenarios

Error response responses will always contain the following error structure in addition to the HTTP error code:

```
{"code":"SOME_CODE", "message":"Error message"}
```

Update records
--------------
Adds or updates a record in the name database. The key for the operation is the host name; if the host name already exists, current name lookup information will be updated.

Method: PUT 
URL: /lookup
Body: A JSON object with data for the DNS record, example:

```
{ "ip": "1.2.3.4", "host": "www.test.com", "ttl": "10", "expires": "3600", "type": "A" }
````

Do lookup
---------
Performs a name lookup, form host name to IP address.

Method: GET
URL: /lookup/[hostname]
Response: HTTP 200 if successful with a JSON response containing the look up data, 404 if not found and 500 in other cases.

Do reverse lookup
-----------------
Method: GET
URL: /lookup/[ip-address]/reverse
Resonse: HTTP 200 if successful with a JSON response containint he lookup data, 404 if not found and 500 in other cases.

Delete name lookup
------------------
Method: DELETE
URL: /lookup/[hostname]
Response: HTTP 200 if successful, 404 if not found and 500 in other scenarios.

Roadmap
=======
The following features are in the pipeline:

- Implement support DNS round-robin
- Honor the "expires" attribute
- Forward the request to an upstream DNS server when a host name cannot be resolved (so NodeNS would effectively act as a DNS proxy)
