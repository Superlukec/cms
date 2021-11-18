var mongoose = require('mongoose');

const {
    Schema
} = mongoose;

module.exports = mongoose.model('Translations', {
    language: String,
    key: String,
    value: String,
    date_created: {
        type: String,
        default: Date.now
    },
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});