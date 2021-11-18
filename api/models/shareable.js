const mongoose = require('mongoose');
const access = require('./access.schema.js');

const {
	Schema
} = mongoose;

module.exports = mongoose.model('Shareable', {	
    name: String,
    duration: {
        type: Boolean,
        default: false
    },
    duration_time: String, 
    limit_download: {
        type: Boolean,
        default: false
    },
    download_number: Number,
    limit_access: {
        type: Boolean,
        default: false
    },    
    access: [access],
    enabled: {
        type: Boolean,
        default: true
    },
    password: String,
    files: [{
        type: Schema.Types.ObjectId,
        ref: 'File'
    }],
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
    downloaded: [{
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        date_created: {
            type: String,
            default: Date.now
        }
    }]
});