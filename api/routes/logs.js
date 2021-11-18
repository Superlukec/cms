const express = require('express');
const router = express.Router();
const passport = require('passport');

const {
    validationResult
} = require('express-validator');

const { checkPermission } = require('../authorization/authorizationUtils');
const roles = require('../authorization/roles');

const logger = require('../helpers/logging')();

module.exports = router;

/**
 * We don't use authentification here
 */
router.put('/', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], getServerLogs);


function getServerLogs(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var options = {
        from: new Date() - (24 * 60 * 60 * 1000),
        until: new Date(),
        //limit: 50,
        start: 0,
        order: 'desc',
        fields: ['message', 'timestamp', 'level', 'context', 'details']
    };


    var inData = req.body;

    if (inData && inData.start_date && inData.end_date) {

        options = {
            from: inData.start_date,
            until: inData.end_date
        }

    }

    try {

        logger.query(options, function(err, results) {
            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Server logs reading - error',
                    context: __filename,
                    details: `Err: ${err}`,
                });

                throw err;
            }

            let logs = [];

            if (results && results.dailyRotateFile) {
                logs = results.dailyRotateFile;
            }

            return res.send({
                success: true,
                logs: logs
            })
        });

    } catch (err) {

        logger.log({
            level: 'error',
            message: 'Server logs reading - error',
            context: __filename,
            details: `Err: ${err}`,
        });

        return res.send({
            success: false,
            message: err
        })

    }

}