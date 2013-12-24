var _ = require('underscore');

// These functions can be set as the stragegy for doing something to name
// resolutions before they're sent to clients and can be used to implement things
// like round robin, for example
module.exports = {
    // strategy that does nothing
    NoStrategy: function(lookups) {
        return(lookups);
    },

    // Simulates a round-robin strategy; well, not really, since Underscore's
    // shuffle doesn0t really do that...
    // TODO: implement this better
    RoundRobin: function(lookups) {
        return(_(lookups).shuffle());
    }   
}