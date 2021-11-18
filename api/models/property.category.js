var mongoose = require('mongoose');

const {
	Schema
} = mongoose;

module.exports = mongoose.model('PropertyCategory', {	
    name: String,
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    counter: {
        type: Number,
        default: 0
    },
    lang_prefix: String,
    date_created: {
        type: String,
        default: Date.now
    },
    sort: {
        type: Number,
        default: 0
    }
});