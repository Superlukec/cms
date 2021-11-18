const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;
const path = require('path');

const File = require('../models/file');
const logger = require('../helpers/logging')();

module.exports = router;

/**
 * We don't use authentification here
 */
router.get('/:id', downloadFile);
router.get('/zip/:name', downloadZip);

//#region download file
/**
 * Download file
 */
function downloadFile(req, res) {

    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id))) {

        File.findOne({
                _id: new ObjectId(id)
            })
            .exec(function(err, file) {

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
                    res.download(path.join(__dirname, '../download/' + id), file.original_name);
                } else {

                    logger.log({
                        level: 'info',
                        message: 'Download file not found',
                        context: __filename,
                        details: 'File: ' + id
                    });

                    res.sendStatus(404);
                }

            });

    } else {
        res.sendStatus(404);
    }

}
//#endregion

//#region zip download
/**
 * Download zip file
 */
function downloadZip(req, res) {
    let name = req.params.name;
    res.download(path.join(__dirname, '../download/' + name), 'download.zip');
}
//#endregion