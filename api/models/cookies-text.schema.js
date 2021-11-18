var mongoose = require('mongoose');

const {
    Schema
} = mongoose;

module.exports = new Schema({
    text: String,
    agree_text: String,
    more_information: String,
    cookie_information: String,
    cookies: [{
        name: String,
        text: String
    }],
    lang: String,
    date_created: {
        type: String,
        default: Date.now
    }
});