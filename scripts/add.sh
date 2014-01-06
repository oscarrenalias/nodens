#!/bin/bash

# Basic case
curl -X PUT -H "Content-Type: application/json" http://localhost:8053/lookup -d '{ "address": "1.2.3.4", "name": "www.test.com", "ttl": "10", "expires": "3600", "type": 1 }'

# Two hosts for the same address
curl -X PUT -H "Content-Type: application/json" http://localhost:8053/lookup -d '{ "address": "1.2.3.5", "name": "www.test1.com", "ttl": "10", "expires": "3600", "type": 1 }'

curl -X PUT -H "Content-Type: application/json" http://localhost:8053/lookup -d '{ "address": "1.2.3.6", "name": "www.test1.com", "ttl": "10", "expires": "3600", "type": 1 }'

# Should not be returned in queries within 2 minutes (120 seconds)
curl -X PUT -H "Content-Type: application/json" http://localhost:8053/lookup -d '{ "address": "1.2.3.7", "name": "www.test1.com", "ttl": "10", "expires": "120", "type": 1 }'
