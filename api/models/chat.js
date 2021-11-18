var mongoose = require('mongoose');

const {
    Schema
} = mongoose;

module.exports = mongoose.model('Chat', {    
    chat_id: String,
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    public: {
        type: Boolean,
        default: false
    },  
    opened: {
        type: Boolean,
        default: false
    },
    user_info: {
        email: String,
        name: String
    },        
    messages: [{
        text: String,
        author: {
            type: Boolean,
            default: false
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        seen: {
            type: Boolean,
            default: false
        },
        date_created: {
            type: String,
            default: Date.now
        }
    }],
    closed: {
        type: Boolean,
        default: false
    },
    site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    date_created: {
        type: String,
        default: Date.now
    }
});