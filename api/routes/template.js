const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;

const {
    check,
    validationResult,
    sanitizeParam,
    body
} = require('express-validator');

const logger = require('../helpers/logging')();

const { checkPermission } = require('../authorization/authorizationUtils');
const roles = require('../authorization/roles');

const Template = require('../models/template');

module.exports = router;


router.get('/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
], getTemplates);

router.get('/:siteid/:templateid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
], getTemplate);

router.post('/', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim(),
    check('description').not().isEmpty().trim(),
    check('html').not().isEmpty().trim(),
    body('fields').custom((item) => Array.isArray(item))
], addTemplate);

router.put('/:siteid/:templateid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    check('name').not().isEmpty().trim(),
    check('description').not().isEmpty().trim(),
    check('html').not().isEmpty().trim(),
    body('fields').custom((item) => Array.isArray(item))
], updateTemplate);

router.delete('/:siteid/:templateid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], deleteTheme);


function getTemplates(req, res) {

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        Template.find({
            site_id: new ObjectId(id)
        })
        .populate('user_id')
        .exec(function(err, templates) {

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
                data: templates
            });

        });

    } else {
        res.sendStatus(401);
    }
}

function getTemplate(req, res) {
    let siteid = req.params.siteid;
    let templateid = req.params.templateid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (
        siteid && checkID.test(siteid) &&
        templateid && checkID.test(templateid)
    ) {

        Template.findOne({
            _id: new ObjectId(templateid),
            site_id: new ObjectId(siteid)
        })
        .populate('user_id')
        .exec(function(err, template) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if(template) {
                return res.send({
                    success: true,
                    data: template
                });
            }
            else {
                return res.send({
                    success: false,
                    message: 'Template not found'
                });
            }

        });

    } else {
        res.sendStatus(401);
    }
}


function addTemplate(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (inData.site_id && checkID.test(inData.site_id)) {

        
        let template = new Template();

        template.name = inData.name;
        template.description = inData.description;
        template.html = inData.html;
        template.site_id = inData.site_id;
        template.user_id = new ObjectId(req.user._id);
        
        if(inData.fields.length > 0) {
            for(let i = 0; i < inData.fields.length; i++) {
                template.fields.push(inData.fields[i]);
            }
        }

        template.save((err) => {

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

        

    } else {
        res.sendStatus(401);
    }

}

function updateTemplate(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }


    let inData = req.body;
    let siteid = req.params.siteid;
    let templateId = req.params.templateid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (
        siteid && checkID.test(siteid) &&
        templateId && checkID.test(templateId)
    ) {


        Template.findOne({
            _id: new ObjectId(templateId),
            site_id: new ObjectId(siteid)
        })
        .exec(function(err, template) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (template) {

                template.name = inData.name;
                template.description = inData.description;
                template.html = inData.html;
        
                if(inData.fields.length > 0) {
                    template.fields = [];
                    for(let i = 0; i < inData.fields.length; i++) {
                        template.fields.push(inData.fields[i]);
                    }
                }

                
                template.save((err) => {

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
                        data: template
                    })
                });

            }
            else {
                return res.send({
                    success: false
                })
            }

        });


    } else {
        res.sendStatus(401);
    }
}


function deleteTheme(req, res) {

    let siteid = req.params.siteid;
    let templateid = req.params.templateid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) &&
        (templateid && checkID.test(templateid))) {


            Template.findOne({
                _id: new ObjectId(templateid),
                site_id: new ObjectId(siteid)
            })
            .exec(function(err, template) {
    
                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });
    
                    throw err;
                }
    
                if (template) {

                    Template.remove({
                        _id: new ObjectId(templateid),
                        site_id: new ObjectId(siteid)
                    }, function(err) {

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
                    
                } 
                else {
                    return res.send({
                        success: false,
                        message: 'Such template does not exists'
                    })
                }

            });
            
        
    } else {
        res.sendStatus(401);
    }
}
