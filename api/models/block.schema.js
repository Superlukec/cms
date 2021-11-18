const mongoose = require('mongoose');
const option = require('./option.schema.js');

const {
	Schema
} = mongoose;

var block = new Schema({
    type: String,
    value: String,   
    options: option
});

module.exports = new Schema({
    type: String,
    value: String,    
    options: option,
    no_columns: Number,
    blocks: [block],
    rows: [block],          // @todo
    date_created: {
        type: String,
        default: Date.now
    }
});