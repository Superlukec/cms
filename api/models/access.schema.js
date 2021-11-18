var mongoose = require('mongoose');

const {
    Schema
} = mongoose;

module.exports = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    /*viewed: {
        type: Number,
        default: 0
    },*/
    date_created: {
        type: String,
        default: Date.now
    }     
});