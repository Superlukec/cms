var mongoose = require('mongoose');

const {
    Schema
} = mongoose;

var field = new Schema({
    type: String,
    name: String,
    label: String,
    required: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Template', {    
    name: String,
    description: String,
    html: String,    
    fields: [field],
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
    }
});