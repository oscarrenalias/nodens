module.exports = {
    // configuration for storage, should not need to be modified
    storage: {
        dbPath: './db',
        collName: 'lookups'
    },

    // DNS and REST API ports for the server
    ports: {
        api: 8053,
        dns: 15353
    },

    dns: {
        // configuration for the DNS upstream
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
};