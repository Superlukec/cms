var mongoose = require('mongoose');
const crypto = require('crypto');

//const company = require('./company.schema.js');

const {
	Schema
} = mongoose;


const UserSchema = new Schema({
	email: String,	
	first_name: String,
	last_name: String,
	full_name: String,
	password: String,
	company: String,
	password_changed: {
		type: String,
		default: Date.now
	},
	salt: String,
	role: {						// 0 admin, 1 ws_team, 2 consultant, 3 user
		type: Number,
		default: 3
	},	
	activation_link: String,
	activated: {
		type: Boolean,
		default: false
	},	
	invitation_message: String,
	validated: {
		type: Boolean,
		default: true
	},	
	password_request_link: String,
	password_request_date: String,
	account_id: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
	},
	site_id: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
	},
	date_created: {
        type: String,
        default: Date.now
	},
	color: String,
	initials: String
});

UserSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.password = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validatePassword = function (password) {
	const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
	return this.password === hash;
};

mongoose.model('User', UserSchema);