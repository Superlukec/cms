var mongoose = require('mongoose');
var System = require('./models/system');

const File = require('./models/file');

const async = require('async');

module.exports = new Promise(function(resolve, reject) {

    System.findOne({
        activity: 'fix-is-image-explorer'
    }).exec(function(err, fix) {

        if (err) {
            throw err;
        }

        if (fix) {            
            resolve(false);
        } else {           

            File.find().exec(function(err, files) {

                if (err) {
                    throw err;
                }

                if(files.length > 0) {

                    async.eachSeries(files, function (file, callback) {

                        if ((/\.(gif|jpe?g|tiff|png|webp|bmp)$/i).test(file.filename)) {
                            file.image = true;
                        }

                        file.save(function(err) {

                            if (err) {
                                throw err;
                            }

                            callback();

                        });

                    }, function (err, results) {

                        if (err) {
                            throw err;
                        }
                        
                        
                        let newInstall = new System();
                        newInstall.activity = 'fix-is-image-explorer';
                        newInstall.save();

                        resolve(true);

                    });

                }
                else {
                    
                    let newInstall = new System();
                    newInstall.activity = 'fix-is-image-explorer';
                    newInstall.save();

                    resolve(true);
                    
                }

            });

        }

    });

});