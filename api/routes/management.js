const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');

const fs = require('fs-extra');
const path = require('path');
const handlebars = require('handlebars');
const spawn = require('child_process').spawn;

const {
    check,
    validationResult,
} = require('express-validator');

const { checkPermission } = require('../authorization/authorizationUtils');
const roles = require('../authorization/roles');
const logger = require('../helpers/logging')();

const User = mongoose.model('User');
const Site = require('../models/site');

module.exports = router;

router.get('/sites', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN])
], getAllSites);

router.post('/site', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN]),
    check('domain').not().isEmpty().trim().escape(),
    check('title').not().isEmpty().trim().escape(),
    check('configuration')
], createSite);

router.delete('/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN])
], deleteSite);


function getAllSites(req, res) {

    Site.find()
        .select('_id title domain public active')
        .exec(function (err, sites) {

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
                success: true,
                data: sites
            });
        });

}

function createSite(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    var newSite = new Site();
    newSite.domain = inData.domain;
    newSite.title = inData.title;

    User.findOne({
        _id: req.user._id
    }).exec(function (err, user) {

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

            let newAdmin = new User();
            newAdmin.email = user.email;
            newAdmin.first_name = user.first_name;
            newAdmin.last_name = user.last_name;
            newAdmin.full_name = user.full_name;
            newAdmin.password = user.password;
            newAdmin.salt = user.salt;
            newAdmin.role = 0;
            newAdmin.color = user.color;
            newAdmin.initials = newAdmin.first_name[0] + newAdmin.last_name[0];
            newAdmin.site_id = newSite._id;
            newAdmin.activated = true;
            newAdmin.validated = true;
            newAdmin.save(function (err) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                newSite.owner_id = new ObjectId(req.user._id)

                newSite.save(function (err, data) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }


                    // nginx conf
                    if (inData.configuration && inData.configuration == true) {


                        if (fs.existsSync('etc/nginx/sites-available') && fs.existsSync(path.join(__dirname, 'template/nginx'))) {

                            let nginxFile = fs.readFileSync('template/nginx', 'utf-8');

                            let template = handlebars.compile(nginxFile);

                            let generatedHtml = template({
                                name: inData.domain
                            });


                            try {

                                fs.writeFileSync('/etc/nginx/sites-available/' + inData.domain, generatedHtml)

                                var restart = spawn('ln', ['-s', '/etc/nginx/sites-available/' + inData.domain, '/etc/nginx/sites-enabled/']);

                                restart.stdout.on('data', function (data) {
                                    console.log(data.toString());
                                });

                                restart.stderr.on('data', function (data) {
                                    console.log(data.toString());
                                });

                                // On process finish
                                restart.on('exit', function (code) {
                                    if (code.toString() != '0') {
                                        console.log('Problems linking');
                                        console.log(code.toString());
                                        process.exit()
                                    }

                                    var restart1 = spawn('systemctl', ['reload', 'nginx.service']);

                                    restart1.stdout.on('data', function (data) {
                                        console.log(data.toString());
                                    });

                                    restart1.stderr.on('data', function (data) {
                                        console.log(data.toString());
                                    });

                                    // On process finish
                                    restart1.on('exit', function (code) {
                                        if (code.toString() != '0') {
                                            console.log('Problems linking');
                                            console.log(code.toString());
                                            process.exit()
                                        }

                                        return res.send({
                                            success: true,
                                            data: newSite._id
                                        });


                                    });

                                });

                            }
                            catch (e) {
                                console.log(e);

                                return res.send({
                                    success: true,
                                    data: newSite._id
                                });
                            }

                        }

                    }


                    return res.send({
                        success: true,
                        data: newSite._id
                    });

                });

            });

        } else {
            return res.send({
                success: false
            });
        }

    });


}


function deleteSite(req, res) {

    let siteid = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (siteid && checkID.test(siteid)) {

        Site.findOne({
            '_id': siteid
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

                Site.deleteOne({
                    '_id': siteid
                })
                    .exec(function (err) {
        
                        if (err) {
                            logger.log({
                                level: 'error',
                                message: 'Mongo - error',
                                context: __filename,
                                details: `stderr: ${err}`,
                            });
        
                            throw err;
                        }
        
                        User.remove({
                            'site_id': siteid
                        }, function (err) {
        
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
                            });
        
                        });
        
                    });

                }
                else {
                    return res.send({
                        success: false
                    });
                }

        });

        


    } else {
        res.sendStatus(401);
    }
}