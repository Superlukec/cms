var mongoose = require('mongoose');

const {
	Schema
} = mongoose;

module.exports = mongoose.model('Theme', {	
    name: String,
    image: String,
    description: String,
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
        },
        date_created: {
            type: String,
            default: Date.now
        }  
    }],    
    public: {
        type: Boolean,
        default: false
    },
    selected: {
        type: Boolean,
        default: false
    },
    author_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },    
    version: {
        type: Number,
        default: 1
    },
    version_installed: String,
    changelog: String,
    changelog_date: String,
    installation_date: {
        type: String,
        default: Date.now
    },
    date_created: {
        type: String,
        default: Date.now
    }    
});