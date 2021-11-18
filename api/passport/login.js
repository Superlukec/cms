const passportJWT = require('passport-jwt');
const mongoose = require('mongoose');

const User = mongoose.model('User');

var settings = require('../config/settings');

const ExtractJWT = passportJWT.ExtractJwt;

var LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;

module.exports = function (passport) {

    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, cb) {

            let siteId = req.body.siteId;
           
            return User.findOne({
                'email': email,
                'site_id': siteId
            })
            .select('-email -validation_code')
            .then(user => {
                
                if (!user) {
                    return cb(null, false, {
                        message: 'Wrong credentials' //'Such user doesn\'t exists'
                    });
                }

                if (!user.validated) {
                    return cb(null, false, {
                        message: 'Your e-mail is not validated. Please validate e-mail first.',
                        not_validate_hint: true
                    });
                }

                if (!user.activated) {
                    return cb(null, false, {
                        message: 'Your account is not activated',
                        not_validate_hint: true
                    });
                }

                if(user.reset_token) {
                    user.reset_token = false;
                    user.save();
                }

                if (user.blocked) {
                    return cb(null, false, {
                        message: 'Your do not have the right permissions to enter the system.'
                    });
                }

                if(!user.validatePassword(password)) {
                    return cb(null, false, {
                        message: 'Wrong credentials'
                    });
                }

                return cb(null, user, {
                    message: 'Logged In Successfully'
                });

            })
            .catch(err => {
                return cb(err);
            });

        }
    ));

    passport.use(new JWTStrategy({
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: settings.secret
        },
        function (jwtPayload, cb) {
            return User.findOne({
                _id: jwtPayload._id
            })
            .then(user => {

                if(user) {

                    if (user.blocked) {
                        return cb(null, null);
                    }
                    else if (user.reset_token) {

                        return cb(null, null);

                    } else {
                        return cb(null, user);
                    }

                }
                else {
                    return cb(null, null);
                }

            })
            .catch(err => {
                return cb(err);
            });
        }
    ));

}