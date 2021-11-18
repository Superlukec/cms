const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const roles = require('../authorization/roles');
const logger = require('../helpers/logging')();

const Shareable = require('../models/shareable');
const File = require('../models/file');
const DownloadManager = require('../models/download-manager');

module.exports = router;

router.get('/:siteid', [
    passport.authenticate('jwt', {
        session: false
    })
], getShareables);

router.get('/:siteid/:id', [
    passport.authenticate('jwt', {
        session: false
    })
], getShareable);

router.get('/prepare/:siteid/:shareableid/:id', [
    passport.authenticate('jwt', {
        session: false
    })
], prepareShareable);

router.get('/zip/:siteid/:id', [
    passport.authenticate('jwt', {
        session: false
    })
], zipShareables);

/**
 * Get shareables
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getShareables(req, res) {

    let siteid = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (siteid && checkID.test(siteid)) {

        let query = {
            site_id: new ObjectId(siteid)
        };

        if (!(roles.AUTHOR > req.user.role)) {
            // if not admin - don't see all shareables

            query['$or'] = [{
                'access.user_id': new ObjectId(req.user._id)
            }, {
                user_id: new ObjectId(req.user._id),
            }];

        }

        Shareable.find(query)
            .exec(function (err, shareables) {

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
                    data: shareables
                });

            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Get shareable
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getShareable(req, res) {

    let siteid = req.params.siteid;
    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (id && checkID.test(id))) {

        let query = {
            _id: new ObjectId(id),
            site_id: new ObjectId(siteid)
        }

        if (!(roles.AUTHOR > req.user.role)) {
            query['access.user_id'] = new ObjectId(req.user._id)
        }

        Shareable.findOne(query)
            .populate('files')
            .exec(function (err, shareable) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (shareable) {
                    return res.send({
                        success: true,
                        data: shareable
                    });
                }
                else {
                    return res.send({
                        success: false,
                        message: 'Shareable not found'
                    });
                }
            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Prepare shareable to download
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function prepareShareable(req, res) {

    let siteid = req.params.siteid;
    let shareableId = req.params.shareableid;
    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (shareableId && checkID.test(shareableId)) && (id && checkID.test(id))) {


        let query = {
            '_id': new ObjectId(shareableId)
        };

        if (!(roles.AUTHOR > req.user.role)) {
            query['access.user_id'] = new ObjectId(req.user._id)
        }

        Shareable.findOne(query)
            .exec(function (err, shareable) {
                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (shareable || (roles.AUTHOR > req.user.role)) {

                    if (shareable) {
                        if (shareable.limit_download && shareable.downloaded) {

                            if (shareable.download_number == shareable.downloaded.length) {

                                return res.send({
                                    success: false,
                                    message: 'Download limit exceeded'
                                });

                            }

                        }
                    }


                    File.findOne({
                        _id: new ObjectId(id),
                        site_id: new ObjectId(siteid)
                    })
                        .exec(function (err, file) {

                            if (err) {
                                logger.log({
                                    level: 'error',
                                    message: 'Mongo - error',
                                    context: __filename,
                                    details: `stderr: ${err}`,
                                });

                                throw err;
                            }

                            if (file) {


                                try {


                                    // we move file
                                    fs.copyFile(file.filepath, path.join(__dirname, '../download/' + file._id.toString()), (err) => {
                                        if (err) {

                                            logger.log({
                                                level: 'error',
                                                message: 'copyFile - prepareShareable',
                                                context: __filename,
                                                details: `stderr: ${err}`,
                                            });

                                            return res.send({
                                                success: false,
                                                message: 'File not found'
                                            });
                                        }

                                        let downloadManager = new DownloadManager();
                                        downloadManager.filepath = path.join(__dirname, '../download/' + file._id.toString());
                                        downloadManager.site_id = siteid;
                                        downloadManager.save((err) => {
                                            if (err) {
                                                logger.log({
                                                    level: 'error',
                                                    message: 'Mongo - error',
                                                    context: __filename,
                                                    details: `stderr: ${err}`,
                                                });

                                                throw err;
                                            }

                                            if (shareable) {

                                                if (!shareable.downloaded) {
                                                    shareable.downloaded = [];
                                                }

                                                shareable.downloaded.push({
                                                    user_id: req.user._id
                                                })

                                                shareable.save((err) => {

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
                                                        data: file._id.toString()
                                                    });

                                                });

                                            }
                                            else {
                                                return res.send({
                                                    success: true,
                                                    data: file._id.toString()
                                                });
                                            }


                                        });

                                    });

                                } catch (e) {

                                    logger.log({
                                        level: 'error',
                                        message: 'copyFile - prepareShareable - unable to copy',
                                        context: __filename,
                                        details: `stderr: ${e}`,
                                    });

                                    return res.send({
                                        success: false,
                                        message: 'File not found'
                                    });
                                }

                                // we return link


                            }
                            else {
                                return res.send({
                                    success: false,
                                    message: 'File not found'
                                });
                            }
                        });


                }
                else {
                    return res.send({
                        success: false,
                        message: 'You don\'t have access to this file'
                    });
                }
            })

    } else {
        res.sendStatus(401);
    }

}

function zipShareables(req, res) {

    let siteid = req.params.siteid;
    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (id && checkID.test(id))) {

        let query = {
            '_id': new ObjectId(id),
            site_id: new ObjectId(siteid)
        };

        if (!(roles.AUTHOR > req.user.role)) {
            query['access.user_id'] = new ObjectId(req.user._id)
        }

        Shareable.findOne(query)
            .populate('files')
            .exec(function (err, shareable) {
                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (shareable || (roles.AUTHOR > req.user.role)) {

                    if (shareable) {
                        if (shareable.limit_download && shareable.downloaded) {

                            if (shareable.download_number == shareable.downloaded.length) {

                                return res.send({
                                    success: false,
                                    message: 'Download limit exceeded'
                                });

                            }

                        }


                        let zipName = id + '_' + Date.now(); //slugify(shareable.name.toLowerCase(), '_');

                        var output = fs.createWriteStream(path.join(__dirname, '../download/' + zipName));
                        var archive = archiver('zip', {
                            zlib: { level: 9 } // Sets the compression level.
                        });

                        for (let i = 0; i < shareable.files.length; i++) {
                            archive.file(shareable.files[i].filepath, { name: shareable.files[i].original_name });
                        }

                        archive.pipe(output);
                        archive.finalize();

                        output.on('close', function () {
                            console.log(archive.pointer() + ' total bytes');
                            console.log('archiver has been finalized and the output file descriptor has closed.');

                            let downloadManager = new DownloadManager();
                            downloadManager.filepath = path.join(__dirname, '../download/' + zipName);
                            downloadManager.site_id = siteid;
                            downloadManager.save((err) => {
                                if (err) {
                                    logger.log({
                                        level: 'error',
                                        message: 'Mongo - error',
                                        context: __filename,
                                        details: `stderr: ${err}`,
                                    });

                                    throw err;
                                }


                                if (shareable) {

                                    shareable.downloaded.push({
                                        user_id: req.user._id
                                    })

                                    shareable.save((err) => {

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
                                            data: zipName
                                        });

                                    });

                                }
                                else {
                                    return res.send({
                                        success: true,
                                        data: zipName
                                    });
                                }

                            });

                            /*
                            setTimeout(() => {
                                fs.unlink(path.join(__dirname, '../download/' + zipName), function(err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            }, 10000)
                            */


                        });

                        output.on('end', function () {
                            console.log('Data has been drained');
                            return res.send({
                                success: true,
                                message: 'Data has been drained'
                            });

                        });

                        // good practice to catch warnings (ie stat failures and other non-blocking errors)
                        archive.on('warning', function (err) {
                            if (err.code === 'ENOENT') {
                                // log warning
                            } else {
                                // throw error
                                logger.log({
                                    level: 'error',
                                    message: 'Mongo - error',
                                    context: __filename,
                                    details: `stderr: ${err}`,
                                });

                                throw err;
                            }
                        });

                        // good practice to catch this error explicitly
                        archive.on('error', function (err) {
                            logger.log({
                                level: 'error',
                                message: 'Mongo - error',
                                context: __filename,
                                details: `stderr: ${err}`,
                            });

                            throw err;
                        });

                    }
                    else {
                        return res.send({
                            success: false,
                            message: 'Shareable not found'
                        });
                    }

                }
                else {
                    return res.send({
                        success: false,
                        message: 'You don\'t have access to this file'
                    });
                }

            });

    }
    else {
        res.sendStatus(401);
    }

}