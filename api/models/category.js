const mongoose = require('mongoose');

const {
	Schema
} = mongoose;

module.exports = mongoose.model('Category', {	    
    name: String,
    slug: String,
    lang_prefix: String,
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    date_created: {
        type: String,
        default: Date.now
    }
});