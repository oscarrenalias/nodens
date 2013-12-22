curl -X PUT -H "Content-Type: application/json" \
http://localhost:8053/lookup -d '{ "address": "1.2.3.4", "name": "www.test.com", "ttl": "10", "expires": "3600", "type": 1 }'