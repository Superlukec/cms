var mongoose = require('mongoose');
const menu = require('./menu.schema.js');
const cookies_text = require('./cookies-text.schema.js');
const chatbot_settings = require('./chatbot-settings.schema.js');

const {
    Schema
} = mongoose;

var language = new Schema({
    language: String,
    prefix: String,
    main: Boolean
});

module.exports = mongoose.model('Site', {
    title: String,
    theme_id: {
        type: Schema.Types.ObjectId,
        ref: 'Theme'
    },
    owner_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    open: {
        type: Boolean,
        default: false
    },
    public: {
        type: Boolean,
        default: false
    },
    seo: {
        type: Boolean,
        default: false
    },
    domain: String,
    active: {
        type: Boolean,
        default: true
    },
    menus: [menu],    
    date_created: {
        type: String,
        default: Date.now
    },
    /**
     * Multilanguage variables
     */
    multilanguage: {
        type: Boolean,
        default: false
    },
    languages: [language],
    main_lang_prefix: String,
    
    /**
     * Cookies 
     */
    cookies_enabled: {
        type: Boolean,
        default: false
    },
    cookies_info: [cookies_text],

    /**
     * Image size
     */
    image_size: [{
        name: String,
        width: Number,
        height: Number,
		algorithm: {
            type: String,
            default: 'center'
        },
        default: {
            type: Boolean,
            default: false
        }
    }],

    /**
     * Google MAPS api
     */
    google_maps_api: String,

    /**
     * Google Analytics api
     */
    google_analytics_api: String,

    /**
     * Product settings
     */
    product_settings: {
        show_form: {
            type: Boolean,
            default: false
        },
        form_id: {
            type: Schema.Types.ObjectId,
            ref: 'Forms'
        }
    },

    /**
     * Sitemap
     */
    sitemap_enabled: {
        type: Boolean,
        default: false
    },
    sitemap_name: String,

    /**
     * Chatting
     */
    chat_enabled: {
        type: Boolean,
        default: false
    },
    chat_settings: chatbot_settings,

    favicon: String

});