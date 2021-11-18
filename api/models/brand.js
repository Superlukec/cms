const mongoose = require('mongoose');

const {
	Schema
} = mongoose;

module.exports = mongoose.model('Brand', {
    name: String,
    description: String,
    logo: String,
    lang_prefix: String,
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    date_created: {
        type: String,
        default: Date.now
    },
    sort: {
        type: Number,
        default: 0
    }    
});