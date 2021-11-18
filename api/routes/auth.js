var express = require('express');
var passport = require('passport');
var settings = require('../config/settings');
const mongoose = require('mongoose');
var router = express.Router();
var validator = require('validator');
var email = require('../email/email.js');
var jwt = require('jsonwebtoken');
const moment = require('moment');
const User = mongoose.model('User');
const logger = require('../helpers/logging')();

const {
    check,
    validationResult
} = require('express-validator');

module.exports = router;

/**
 * LoggedIn function
 */
router.get('/loggedin', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    var token = getToken(req.headers);

    if (token) {
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

function getToken(headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

//#region login
/**
 * Log In
 */
router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            res.status(401);
            return next(err);
        }
        if (!user) {
            res.status(401);
            return res.send(info);
        }
        req.logIn(user, {
            session: false
        }, function(err) {
            if (err) {
                res.status(401);
                return next(err);
            }

            logger.log({
                level: 'info',
                message: 'User logged in',
                context: __filename,
                details: 'User: ' + user._id
            });

            // tokens are able to decode
            let json_user = user.toJSON();
            delete json_user['password'];
            delete json_user['hash'];
            delete json_user['salt'];
            delete json_user['company'];
            delete json_user['address'];
            delete json_user['contact_number'];
            delete json_user['date_created'];
            delete json_user['introduction'];
            delete json_user['best_times_touch'];
            delete json_user['last_name'];
            delete json_user['first_name'];

            var token = jwt.sign(json_user, settings.secret, {
                expiresIn: '30d'
            });
            token = 'bearer ' + token;

            return res.json({
                user,
                token
            });
        });
    })(req, res, next);

});
//#endregion

//#region email validation
/**
 * Request e-mail validation
 */
router.post('/request/validation', [
    check('username').isEmail()
], function(req, res, next) {

    var inData = req.body;

    if ((!inData.username) || (!validator.isEmail(inData.username))) {

        return res.send({
            success: false,
            message: 'E-mail not correct'
        });

    } else {

        User.findOne({
            'email': inData.username.toLowerCase()
        }, function(err, user) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (user) {

                if (!user.validated) {

                    /**
                     * Check for enough time
                     */

                    if (user.validation_email_last_request_date) {

                        let now = moment(new Date());
                        let end = moment(user.validation_email_last_request_date, 'x');

                        let duration = moment.duration(now.diff(end));

                        if (duration.years() == 0 && duration.months() == 0 && duration.days() == 0 && duration.hours() == 0) {

                            if (duration.minutes() < 10) {

                                return res.send({
                                    success: false,
                                    message: 'You have made request recently. Please try again after few minutes.',
                                    timeout: true
                                });

                            }
                        }

                    }

                    user.validation_email_last_request_date = Date.now();
                    user.save(function(err) {
                        if (err) {
                            logger.log({
                                level: 'error',
                                message: 'Mongo - error',
                                context: __filename,
                                details: `stderr: ${err}`,
                            });

                            throw err;
                        }

                        var link = req.headers.origin + '/validation/' + user.validation_code;

                        email.sendEmail(
                            user.email,
                            'Please validate your e-mail account',
                            'Please validate your account by visiting link - ' + link,
                            'email_validate.html', {
                                link: link
                            }
                        );

                        return res.send({
                            success: true
                        })
                    });

                } else {

                    return res.send({
                        success: false,
                        message: 'This e-mail is already validated'
                    })

                }

            } else {

                return res.send({
                    success: false,
                    message: 'Such e-mail does not exists'
                })

            }

        });

    }
});
//#endregion

//#region forgot password
/**
 * Forgot password function
 */
router.post('/forgot/pass', [
    check('username').isEmail()
], function(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    if ((!inData.username) || (!validator.isEmail(inData.username))) {

        logger.log({
            level: 'info',
            message: 'Email not correct',
            context: __filename,
            details: 'Email: ' + inData.username
        });

        return res.send({
            success: false,
            message: 'E-mail not correct'
        });

    } else {

        User.findOne({
            'email': inData.username.toLowerCase()
        }, function(err, user) {

            if (err) {

                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });


                throw err;
            }

            if (user) {

                logger.log({
                    level: 'info',
                    message: 'Password reset started',
                    context: __filename,
                    details: 'User: ' + user._id
                });

                /**
                 * Check for enough time
                 */

                if (user.password_request_date) {

                    let now = moment(new Date());
                    let end = moment(user.password_request_date, 'x');

                    let duration = moment.duration(now.diff(end));

                    if (duration.years() == 0 && duration.months() == 0 && duration.days() == 0 && duration.hours() == 0) {

                        if (duration.minutes() < 10) {

                            logger.log({
                                level: 'info',
                                message: 'Request too early',
                                context: __filename,
                                details: 'User: ' + user._id
                            });

                            return res.send({
                                success: false,
                                message: 'You have requested new password recently. Please try again after few minutes.',
                                timeout: true
                            });

                        }
                    }

                }


                user.password_request_link = Math.round((Math.pow(36, 12 + 1) - Math.random() * Math.pow(36, 12))).toString(36).slice(1);
                user.password_request_date = Date.now();
                user.save(function(err) {
                    if (err) {

                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }


                    var link = req.headers.origin + '/login/forgot/' + user.password_request_link;

                    email.sendEmail(
                        user.email,
                        'Request for password reset',
                        'Follow this link (' + link + ') to create new password',
                        'forgot_password.html', {
                            link: link
                        }
                    );

                    return res.send({
                        success: true
                    });


                });

            } else {

                return res.send({
                    success: true
                });

            }

        });

    }

});

/**
 * Check if password request link is OK
 */
router.get('/forgot/pass/:id', function(req, res) {

    var id = req.params.id;

    if (id) {

        User.findOne({
            'password_request_link': id
        }, function(err, user) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (user) {

                return res.send({
                    success: true
                })

            } else {

                return res.send({
                    success: false
                })

            }

        });

    } else {
        res.send(401);
    }

});


/**
 * New password - after forgot update process
 */
router.post('/forgot/update', [
    check('forgotPasswordId').not().isEmpty().trim(),
    check('password').not().isEmpty().trim().isLength({ min: 8 })
], function(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    User.findOne({
        password_request_link: inData.forgotPasswordId
    }).exec(function(err, user) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (user) {

            user.setPassword(inData.password);
            user.password_changed = Date.now();
            user.password_request_link = '';
            user.save(function(err) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                return res.send({
                    success: true
                })

            })

        } else {

            return res.send({
                success: false,
                message: 'Such ID doesn\'t not exists'
            })

        }

    });


});
//#endregion