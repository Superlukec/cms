const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;
const logger = require('../helpers/logging')();

const { checkPermission } = require('../authorization/authorizationUtils');
const roles = require('../authorization/roles');

const {
    check,
    validationResult,
    sanitizeParam    
} = require('express-validator');

const Site = require('../models/site');

module.exports = router;

router.post('/', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('url').not().isEmpty().trim()    
], saveFavicon);

router.get('/:siteid', getFaviconPublic);

router.delete('/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], deleteFavicon);

/**
 * Save favicon
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function saveFavicon(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    Site.findOne({
        _id: new ObjectId(inData.site_id)
    })
    .exec(function (err, site) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if(site) {
            site.favicon = inData.url;
            site.save((err) => {

                if(err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });
                }

                return res.send({
                    success: true
                });

            });
        }
        else {
            return res.send({
                success: false
            });
        }

    });



}


/**
 * Get favicon
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getFaviconPublic(req, res) {

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        Site.findOne({
            _id: new ObjectId(id)
        })  
        .select('favicon')       
        .exec(function (err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }
 
            if (site) {

                return res.send({
                    success: true,
                    data: site.favicon
                });

            } else {
                return res.send({
                    success: false
                });
            }

        });

    }
    else {
        return res.send({
            success: false
        });
    }

}

/**
 * Delete favicon
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function deleteFavicon(req, res) { 

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        Site.findOne({
            _id: new ObjectId(id)
        })  
        .select('favicon')       
        .exec(function (err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }
 
            if (site) {

                // we delete file?

                site.favicon = null;
                site.save((err) => {

                    if(err) {    
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });
                    }
    
                    return res.send({
                        success: true
                    });
    
                });


            } else {
                return res.send({
                    success: false
                });
            }

        });

    }
    else {
        res.sendStatus(401);
    }    

}