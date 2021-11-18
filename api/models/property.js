var mongoose = require('mongoose');

const {
	Schema
} = mongoose;

module.exports = mongoose.model('Property', {	
    name: String,
    counter: {
        type: Number,
        default: 0
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    lang_prefix: String,
    date_created: {
        type: String,
        default: Date.now
    },
    sort: {
        type: Number,
        default: 0
    },    
    category: [{
        type: Schema.Types.ObjectId,
        ref: 'PropertyCategory'
    }]
});