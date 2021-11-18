const mongoose = require('mongoose');

const {
	Schema
} = mongoose;

var feature = new Schema({
    icon: String,
    name: String,
    text: String,
    order: Number
});

var image = new Schema({
    src: String,
    file: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    hero: Boolean
});

var attachment = new Schema({
    name: String,
    file: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    icon: String
});

module.exports = mongoose.model('Product', {
    name: String,
    description: String,
    excerpt: String,
    slug: String,
    features: [feature],
    images: [image],   
    attachments: [attachment], 
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    brand_id: {
        type: Schema.Types.ObjectId,
        ref: 'Brand'
    },
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    properties: [{
        type: Schema.Types.ObjectId,
        ref: 'Property'
    }],
    lang_prefix: String,
    lang_sibling_pages: [{
        post_id: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    }],
    date_created: {
        type: String,
        default: Date.now
    },
    // meta keyword
    meta_keywords: String,
    meta_description: String,
    sort: {
        type: Number,
        default: 0
    }
});