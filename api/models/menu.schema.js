var mongoose = require('mongoose');

const {
    Schema
} = mongoose;

module.exports = new Schema({
    name: String,
    slug: String,
    menu: [{
        lang_prefix: String,
        /*pages: [{
            page_id: {
                type: Schema.Types.ObjectId,
                ref: 'Post'
            },
            order: Number
        }]*/
        pages: [{
            category: String,           // just link
            page_id: {
                type: Schema.Types.ObjectId,
                ref: 'Post'
            },
            order: Number,
            children: [{
                category: String,       // just link
                page_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Post'
                },
                order: Number,
                children: [{
                    category: String,   // just link
                    page_id: {
                        type: Schema.Types.ObjectId,
                        ref: 'Post'
                    },
                    order: Number
                }]            
            }]            
        }]
    }]
});