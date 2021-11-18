const path = require('path');
const fs = require('fs');
const async = require('async');
const mongoose = require('mongoose');
const dbConfig = require('./config/db');

mongoose.connect(dbConfig.url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

const logger = require('./helpers/logging')();

const DownloadManager = require('./models/download-manager');

var proccessIsRunning = false;

setInterval(() => {

    if (!proccessIsRunning) {

        proccessIsRunning = true;

        DownloadManager.find().exec(function (err, files) {

            if (err) {
                throw err;
            }

            if (files.length > 0) {

                let currentDate = new Date();
                let ONE_HOUR = 60 * 60 * 1000;

                async.eachSeries(files, function (file, callback) {

                    // we check the date
                    if ((currentDate - new Date(parseInt(file.date_created))) > ONE_HOUR) {

                        try {

                            fs.unlink(file.filepath, function (err) {
                                if (err) {
                                    //throw err;
                                }

                                DownloadManager.deleteOne({
                                    '_id': file._id
                                }, (err) => {

                                    if (err) {
                                        throw err;
                                    }

                                    callback();

                                });

                            });

                        }
                        catch (e) {

                            DownloadManager.deleteOne({
                                '_id': file._id
                            }, (err) => {

                                if (err) {
                                    throw err;
                                }

                                logger.log({
                                    level: 'error',
                                    message: 'File couldn\'t not be deleted',
                                    context: 'download-worker.js',
                                    details: e
                                });
    
                                callback();

                            });

                            
                        }
                    }
                    else {
                        callback();
                    }

                }, function () {                    
                    proccessIsRunning = false;
                });

            }
            else {
                proccessIsRunning = false;
            }

        });

    }

}, 15000)