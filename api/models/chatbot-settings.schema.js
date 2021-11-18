var mongoose = require('mongoose');

const {
    Schema
} = mongoose;

module.exports = new Schema({
    text: [{
        lang: String,
        intro_text: String,
        intro_btn: String,
        contact_text: String,
        your_name: String,
        your_email: String,
        privacy_text: String,
        privacy_link: String,
        continue_text: String,
        welcome_text: String,
        write_message: String
    }],    
    working_hours_enabled: {
        type: Boolean,
        default: false
    },        
    working_hours: [{
        day: Number,
        from_hour: Number,
        from_minutes: Number,
        to_hour: Number,
        to_minutes: Number,
        closed: Boolean
    }],
    working_hours_type: String,
    date_created: {
        type: String,
        default: Date.now
    }
});