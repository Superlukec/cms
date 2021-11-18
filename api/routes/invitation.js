const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;

const {
    check,
    validationResult,
} = require('express-validator');

const User = mongoose.model('User');
const logger = require('../helpers/logging')();

module.exports = router;

router.get('/:siteId/:invitationId', getInvitation);
router.put('/:siteId/:invitationId', [
    check('first_name').not().isEmpty().trim().escape(),
    check('last_name').not().isEmpty().trim().escape(),
    check('full_name').not().isEmpty().trim().escape(),
    check('password').not().isEmpty()
], approveInvitation);

function getInvitation(req, res) {

    let siteId = req.params.siteId;
    let invitationId = req.params.invitationId;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteId && checkID.test(siteId)) && (invitationId)) {

        User.findOne({         
            site_id: new ObjectId(siteId),
            activation_link: invitationId,
            activated: false        
        })       
        .select('email last_name first_name') 
        .exec(function(err, user) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });
                
                throw err;
            }

            if(user) {                
                return res.send({
                    success: true,
                    data: user
                });   
            }
            else {
                return res.send({
                    success: false,
                    message: 'Invitation is not found'
                });   
            }
        });

    } else {
        res.sendStatus(401);
    }

}

function approveInvitation(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let siteId = req.params.siteId;
    let invitationId = req.params.invitationId;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');   
    var inData = req.body;

    if ((siteId && checkID.test(siteId)) && (invitationId)) {

        User.findOne({         
            site_id: new ObjectId(siteId),
            activation_link: invitationId,
            activated: false        
        })               
        .exec(function(err, user) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if(user) {         

                user.activated = true;
                user.first_name = inData.first_name;
                user.last_name = inData.last_name;
                user.full_name = inData.full_name;

                if (inData.password) {
                    
                    try {
                        user.setPassword(inData.password);
                    } catch(e) {
                        
                        return res.send({
                            success: false,
                            message: 'Please choose different password'
                        });   

                    }

                }
                
                user.save((err) => {

                    if(err) {
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
                    message: 'Invitation is not found'
                });   
            }
        });

        
    } else {
        res.sendStatus(401);
    }   

}