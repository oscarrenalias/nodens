module.exports = {
    storage: {
        dbPath: './db',
        collName: 'lookups'
    },

    ports: {
        api: 8053,
        dns: 15353
    },

    dns: {
        upstream: {
            enabled: true,
            ip: '8.8.8.8'
        }
    }
};