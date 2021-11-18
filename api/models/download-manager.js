const mongoose = require('mongoose');

const {
	Schema
} = mongoose;

module.exports = mongoose.model('DownloadManager', {    
    filepath: String,
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    date_created: {
        type: String,
        default: Date.now
    }
});