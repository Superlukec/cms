var mongoose = require('mongoose');

const {
    Schema
} = mongoose;

var element = new Schema({
    value: String,
    name: String    
});

module.exports = mongoose.model('FormSubmit', {    
    elements: [element],
    ip: String,
    emailSent: {
        type: Boolean,
        default: false
    },
    errorMessageMail: String,
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    form_id: {
        type: Schema.Types.ObjectId,
        ref: 'Form'
    },
    location: String,
    date_created: {
        type: String,
        default: Date.now
    }
});