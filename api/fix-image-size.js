var mongoose = require('mongoose');
var System = require('./models/system');

const defaultImageSize = require('./config/imagesize');
const Site = require('./models/site');

const async = require('async');

module.exports = new Promise(function(resolve, reject) {

    System.findOne({
        activity: 'fix-image-size'
    }).exec(function(err, fix) {

        if (err) {
            throw err;
        }

        if (fix) {            
            resolve(false);
        } else {

            Site.find({ 
                image_size: null
            })
            .exec(function(err, sites) {

                if (err) {
                    throw err;
                }

                if(sites.length == 0) {

                    let newInstall = new System();
                    newInstall.activity = 'fix-image-size';
                    newInstall.save();

                    resolve(true);

                }
                else {

                    async.eachSeries(sites, function (site, callback) {
                        
                        
                        /**
                         * Initial image size
                         */
                        site.image_size = [];
                        for(let i = 0; i < defaultImageSize.length; i++) {
                            site.image_size.push({
                                name: defaultImageSize[i].name,
                                width: defaultImageSize[i].width,
                                height: (defaultImageSize[i].height) ? defaultImageSize[i].height : null,
                                algorithm: defaultImageSize[i].algorithm,                                
                                default: true
                            })
                        }
                        

                        site.save((err) => {

                            if (err) {
                                throw err;
                            }

                            callback();

                        });

                       

                    }, function (err, results) {

                        if(err) {
                            throw err;
                        }

                        let newInstall = new System();
                        newInstall.activity = 'fix-image-size';
                        newInstall.save();

                        resolve(true);

                    });                   

                }

            });


        }

    });

});