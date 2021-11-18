var mongoose = require('mongoose');

const {
    Schema
} = mongoose;

module.exports = mongoose.model('File', {
    filename: String,
    filepath: String,
    file_dimensions: [{
        name: String,
        filename: String
    }],
    original_name: String,
    filesize: Number,   // in bytes
    filetype: String,
    url: String,
    visible_public: {
        type: Boolean,
        default: false
    },
    transfer: {
        type: Boolean,
        default: false
    },
    image: {
        type: Boolean,
        default: false
    },
    unused: {
        type: Boolean,
        default: false
    },
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    theme_id: {
        type: Schema.Types.ObjectId,
        ref: 'Theme'
    },
    date_created: {
        type: String,
        default: Date.now
    }
});

