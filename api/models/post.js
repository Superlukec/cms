const mongoose = require('mongoose');
const block = require('./block.schema.js');
const option = require('./option.schema.js');

const {
    Schema
} = mongoose;

module.exports = mongoose.model('Post', {
    title: String,
    slug: String,
    type: String, // post | page
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    category_id: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }],
    blocks: [block],
    homepage: {
        type: Boolean,
        default: false
    },    
    options: option,    
    html: String,    
    lang_prefix: String,
    lang_sibling_pages: [{
        post_id: {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    }],
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    date_created: {
        type: String,
        default: Date.now
    },
    last_change_date: {
        type: String,
        default: Date.now
    },
    last_change_user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    show_links_menu_children: {
        type: Boolean,
        default: false
    },
    custom_link: {                  // for blank pages
        type: Boolean,
        default: false
    },
    // meta keyword
    meta_keywords: String,
    meta_description: String,
    // featured image
    featured_image: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    version: {
        type: Number,
        default: 0
    },
    backup: [{
        version: Number,
        blocks: [block],
        html: String,    
        date_created: {
            type: String,
            default: Date.now
        }
    }],
    deleted: {
        type: Boolean,
        default: false
    },
    redirect: {
        type: Boolean,
        default: false
    },
    redirect_url: String,
    private_page: {
        type: Boolean,
        default: false
    }
});