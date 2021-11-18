var mongoose = require('mongoose');

module.exports = mongoose.model('System', {	
    activity: String,
    date_created: {
        type: String,
        default: Date.now
    }    
});