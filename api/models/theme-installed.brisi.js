var mongoose = require('mongoose');

const {
	Schema
} = mongoose;

module.exports = mongoose.model('ThemeInstalled', {	    
    configured: Boolean,
    configured_date: String,
    configured_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    configuration: [{
        layout: {
            header: String,
            //body: String,
            footer: String
        }, 
        css: String,
        jsfile: String,
        configured_user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    theme_id: {
        type: Schema.Types.ObjectId,
        ref: 'Theme'
    },
    installation_date: {
        type: String,
        default: Date.now
    },
    version_installed: String  
});