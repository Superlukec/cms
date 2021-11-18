const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const uploadTheme = multer({ dest: path.join(__dirname, '../tmp') });
const extract = require('extract-zip');

const {
    check,
    validationResult,
    sanitizeParam
} = require('express-validator');

const { checkPermission } = require('../authorization/authorizationUtils');
const roles = require('../authorization/roles');
const logger = require('../helpers/logging')();

const Theme = require('../models/theme');
const DownloadManager = require('../models/download-manager');

module.exports = router;

router.put('/backup/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    })
], backupThemes);

router.post('/load/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    uploadTheme.fields([{ name: 'file', maxCount: 1 }])
], loadTheme);

router.post('/restore/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
], restoreTheme);

router.delete('/install/folder/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], deleteInstallFolder);

router.get('/version/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], getThemeVersions);

router.put('/revert/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    check('number').not().isEmpty().trim().escape(),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    })
], revertTheme);

/**
 * Backup themes
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function backupThemes(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id))) {

        let siteId = inData.site_id;

        Theme.findOne({
            _id: new ObjectId(id),
            site_id: new ObjectId(siteId)
        })
            .exec(function (err, theme) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (theme) {

                    let zipName = theme._id + Date.now();
                    var output = fs.createWriteStream(path.join(__dirname, '../download/' + zipName));
                    var archive = archiver('zip', {
                        zlib: { level: 9 } // Sets the compression level.
                    });

                    let configuration = theme.configuration[theme.configuration.length - 1];

                    archive.append(configuration.layout.header, { name: 'header.html' });
                    archive.append(configuration.layout.footer, { name: 'footer.html' });
                    archive.append(configuration.css, { name: 'style.css' });
                    archive.append(configuration.jsfile, { name: 'script.js' });

                    archive.pipe(output);
                    archive.finalize();

                    output.on('close', function () {
                        console.log(archive.pointer() + ' total bytes');
                        console.log('archiver has been finalized and the output file descriptor has closed.');

                        let downloadManager = new DownloadManager();
                        downloadManager.filepath = path.join(__dirname, '../download/' + zipName);
                        downloadManager.site_id = siteId;
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

                            return res.send({
                                success: true,
                                data: zipName
                            });
                        });
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
                        success: false
                    });
                }

            });


    }
    else {
        res.sendStatus(401);
    }

}


async function loadTheme(req, res, next) {

    let inData = req.body;

    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (inData.site_id && checkID.test(inData.site_id))) {

        let directory = path.join(__dirname, '../tmp/' + id);
        let filePath = req.files.file[0].path;

        try {

            await extract(filePath, { dir: directory })
            console.log('Extraction complete')

            try {
                fs.unlinkSync(filePath)
                //file removed
            } catch (err) {
                console.error(err)
            }

            let listOfRequiredFiles = [
                'footer.html',
                'header.html',
                'script.js',
                'style.css'
            ]

            let listLength = listOfRequiredFiles.length;
            let allFiles = 0;

            fs.readdirSync(directory).forEach(file => {

                allFiles++;

                for (let i = 0; i < listLength; i++) {

                    if (file == listOfRequiredFiles[i]) {
                        listOfRequiredFiles.splice(i, 1);
                        listLength--;
                        i--;
                    }

                }

            });

            if (allFiles > 4) {

                deleteFolderRecursive(directory);

                return res.send({
                    success: false,
                    zip: false,
                    message: 'Too many files in zip'
                });
            }
            else {
                if (listLength == 0) {
                    return res.send({
                        success: true
                    });
                }
                else {
                    deleteFolderRecursive(directory);

                    return res.send({
                        success: false,
                        zip: true,
                        file: listOfRequiredFiles
                    });
                }
            }

        } catch (err) {
            // handle any errors
            deleteFolderRecursive(directory);

            try {
                fs.unlinkSync(filePath)
                //file removed
            } catch (err) {
                console.error(err)
            }

            return res.send({
                success: false,
                zip: false,
                message: err
            });
        }


    }
    else {
        res.sendStatus(401);
    }

}

function restoreTheme(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id))) {

        let siteId = inData.site_id;

        Theme.findOne({
            _id: new ObjectId(id),
            site_id: new ObjectId(siteId)
        })
            .exec(function (err, theme) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                let directory = path.join(__dirname, '../tmp/' + id);


                if (theme) {

                    let listOfRequiredFiles = [{
                        file: 'footer.html',
                        name: 'header'
                    }, {
                        file: 'header.html',
                        name: 'footer'
                    },
                    {
                        file: 'script.js',
                        name: 'jsfile'
                    },
                    {
                        file: 'style.css',
                        name: 'css'
                    }]

                    let outputfile = [];

                    fs.readdirSync(directory).forEach(file => {

                        for (let i = 0; i < listOfRequiredFiles.length; i++) {

                            if (file == listOfRequiredFiles[i].file) {

                                try {
                                    let contents = fs.readFileSync(directory + '/' + file, { encoding: 'utf-8' });

                                    outputfile.push({
                                        'name': listOfRequiredFiles[i].name,
                                        'value': contents
                                    })

                                } catch (e) {

                                    deleteFolderRecursive(directory);

                                    return res.send({
                                        success: false,
                                        message: e
                                    });

                                }

                            }

                        }

                    });

                    deleteFolderRecursive(directory);

                    return res.send({
                        success: true,
                        data: outputfile
                    });

                }
                else {
                    deleteFolderRecursive(directory);

                    return res.send({
                        success: false,
                        message: 'Theme not found'
                    });
                }

            });

    }
    else {
        res.sendStatus(401);
    }

}


function deleteInstallFolder(req, res) {

    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id))) {

        let directory = path.join(__dirname, '../tmp/' + id);
        deleteFolderRecursive(directory);

        return res.send({
            success: true
        });

    }
    else {
        res.sendStatus(401);
    }

}

function getThemeVersions(req, res) {

    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id))) {

        Theme.findOne({
            _id: new ObjectId(id)
        })
            .exec(function (err, theme) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (theme) {
                    return res.send({
                        success: true,
                        data: theme.configuration
                    });
                }
                else {
                    return res.send({
                        success: false,
                        message: 'Theme not found'
                    });
                }

            });

    }
    else {
        res.sendStatus(401);
    }

}

function revertTheme(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    let id = req.params.id;
    let site_id = inData.site_id;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (site_id && checkID.test(site_id)) && !isNaN(inData.number)) {

        Theme.findOne({
            _id: new ObjectId(id),
            site_id: new ObjectId(site_id)
        })
            .exec(function (err, theme) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (theme) {

                    let confNumber = theme.configuration.length;

                    for (let i = 0; i < confNumber; i++) {

                        if (i > parseInt(inData.number)) {

                            theme.configuration.pop();

                        }

                    }

                    theme.version += 1;

                    theme.save((err) => {

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
                            data: theme.configuration[theme.configuration.length - 1]
                        });

                    });

                }
                else {
                    return res.send({
                        success: false,
                        message: 'Theme not found'
                    });
                }

            });

    }
    else {
        res.sendStatus(401);
    }

}

const deleteFolderRecursive = function (p) {
    if (fs.existsSync(p)) {
        fs.readdirSync(p).forEach((file, index) => {
            const curPath = path.join(p, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(p);
    }
};