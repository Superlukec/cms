var mongoose = require('mongoose');

const {
    Schema
} = mongoose;

var element = new Schema({
    type: String,
    name: String,
    label: String,
    required: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Forms', {
    elements: [element],
    submit_btn: String,
    name: String,
    recipients: String,
    email: String,
    html: String,
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