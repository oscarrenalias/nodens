var _ = require('underscore');

module.exports = {
    getDbPath: function() {
        return('./test/db');
    },

    getCollName: function() {   // generates random collection names
        return(_.random(1213231).toString());
    }
}