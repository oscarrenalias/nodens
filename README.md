Introduction
============
Nodens is a very simple DNS server built on DNS that exposes a RESTful API that allows clients to maintain the DNS lookup data.

Current features:

- RESTful API to maintain the name database
- Basic resolution of DNS queries
- Proxying of requests to a real DNS server
- Simple form of round-robin (more like random order of responses)

Keep in mind that only the following DNS record types are supported: A, AAAA, NS, CNAME, PTR, NAPTR, TXT, MX, SRV, SOA

Getting started
===============
Run these to get started:

```
npm install
node app.js
curl -X PUT -H "Content-Type: application/json" http://localhost:8053/lookup -d '{ "address": "1.2.3.4", "name": "www.test.com", "ttl": "10", "expires": "3600", "type": 1 }'
dig @127.0.0.1 -p 15353 www.test.com
```

The last command should generate a response resolving "www.test.com" to "1.2.3.4".

Default port for the DNS server is 15353 and for the REST API is 8053. See below in the configuration section for more information on how to change the ports.

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
Body: A JSON object with data for the DNS record, example for an A record:

```
{ "address": "1.2.3.4", "name": "www.test.com", "ttl": "10", "expires": "3600", "type": 1 }
````

Message fields:

- address: specifies the IP address for the name record
- name: specifies the name of the host that is mapped to the given address
- ttl: DNS time-to-live, in seconds
- expires: validity period of the name record for the server, in seconds
- type: numeric DNS record type, one of the following: 1 (A), 28 (AAAA), 2 (NS), 5 (CNAME), 12 (PTR), 35 (NAPTR), 16 (TXT), MX (15), SRV (33), SOA (6)

Other record types will require different information; unfortunately those have not been thoroughly tested yet and the specific list of fields required in a message is not documented.

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

Configuration
=============
Server configuration is stored in file ```config.js```.

The ports block allows to configure the ports used by the DNS as well as the HTTP server:
```
ports: {
        api: 8053,
        dns: 15353
    }
```

Alternatively, these can also be set using the system environment variables ```DNSPORT``` and ```APIPORT```.

Use the ```dns``` section to enable DNS request proxying:

```
dns: {
        upstream: {
            // enabled or disabled
            enabled: true,
            // IP address, default one of Google's
            ip: '8.8.8.8',
            // options for the DNS client
            client: {
                // timeout in milliseconds for each request
                timeout: 3000
            }
        }
    }
```
Only one IP address of an upstream DNS server can be set in the configuration. If the server is not available or can be reached, proxied requests will fail accordingly.

Running in Docker
=================
TODO: Docker support is currently in progress.

Roadmap
=======
The following features are in the pipeline:

- Honor the "expires" attribute
