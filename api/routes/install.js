const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const fs = require('fs');
const path = require('path');

const User = mongoose.model('User');
const Site = require('../models/site');
const System = require('../models/system');

const settings = require('../config/settings');
const defaultImageSize = require('../config/imagesize');
const logger = require('../helpers/logging')();

const {
    check,
    validationResult,
} = require('express-validator');

module.exports = router;

router.get('/status', shouldInstall);
router.post('/start', [
    check('title').not().isEmpty().trim().escape(),
    check('domain').not().isEmpty().trim().escape(),
    check('email').not().isEmpty().trim().escape(),
    check('first_name').not().isEmpty().trim().escape(),
    check('last_name').not().isEmpty().trim().escape(),
    check('password').not().isEmpty().trim().escape(),
], startInstall);

/**
 * Get system install status
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function shouldInstall(req, res) {

    System.findOne({
        activity: 'install'
    }).exec(function(err, install) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (!install) {
            return res.send({
                should: true
            });
        }
        else {
            return res.send({
                should: false
            });
        }

    });

}

function startInstall(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }
    
    var inData = req.body;

    System.findOne({
        activity: 'install'
    }).exec(function(err, install) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (!install) {
           
            /**
             * We add site
             */
            let newSite = new Site();
            newSite.title = inData.title;
            newSite.domain = inData.domain;

            /**
             * Initial image size
             */
            newSite.image_size = [];
            for(let i = 0; i < defaultImageSize.length; i++) {
                newSite.image_size.push({
                    name: defaultImageSize[i].name,
                    width: defaultImageSize[i].width,
                    height: (defaultImageSize[i].height) ? defaultImageSize[i].height : null,
                    algorithm: defaultImageSize[i].algorithm,
                    default: true
                })
            }

            /**
             * We need to add new user admin / admin
             */
            let newAdmin = new User();
            newAdmin.email = inData.email;
            newAdmin.first_name = inData.first_name;
            newAdmin.last_name = inData.last_name;
            newAdmin.full_name = inData.first_name + ' ' + inData.last_name;
            newAdmin.setPassword(inData.password);
            newAdmin.role = 0;
            newAdmin.color = '#' + Math.floor(Math.random()*16777215).toString(16);
            newAdmin.initials = newAdmin.first_name[0] + newAdmin.last_name[0];      
            newAdmin.site_id = newSite._id;
            newAdmin.activated = true;
            newAdmin.validated = true;
            newAdmin.save(function(err) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                newSite.owner_id = newAdmin._id;

                newSite.save(function(err) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }

                    // we prepare the settings.json file in asset
                    let settingsJson = { 
                        api: 'http://api.' + newSite.domain
                    };

                    let data = JSON.stringify(settingsJson);
                    //fs.writeFileSync('settings.json', data);

                    fs.writeFileSync(
                        path.join(
                            __dirname,
                            '../../',
                            settings.development ?
                                ('web/src/assets/settings.json') :
                                ('web/dist/browser/assets/settings.json')
                        )
                        , data);

                                            // created fixes
                    let newInstall = new System();
                    newInstall.activity = 'install';
                    newInstall.save();

                    let newInstall1 = new System();
                    newInstall1.activity = 'fix-date-post';
                    newInstall1.save();

                    let newInstall2 = new System();
                    newInstall2.activity = 'fix-theme';
                    newInstall2.save();

                    let newInstall3 = new System();
                    newInstall3.activity = 'fix-users';
                    newInstall3.save();

                    let newInstall4 = new System();
                    newInstall4.activity = 'fix-image-size';
                    newInstall4.save();

                    return res.send({
                        success: true
                    })

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