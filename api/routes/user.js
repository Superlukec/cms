const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const logger = require('../helpers/logging')();
const User = mongoose.model('User');

module.exports = router;


router.get('/info', [
    passport.authenticate('jwt', {
        session: false
    })
], getUserInfo);

/**
 * Get user info
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getUserInfo(req, res) {

    User.findOne({
        _id: new ObjectId(req.user._id)
    })
        .select('-password -password_changed -salt -company')
        .exec(function (err, user) {

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

                res.send({
                    success: true,
                    data: user
                });

            } else {
                res.sendStatus(401);
            }

        });

}

