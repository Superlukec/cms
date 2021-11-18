var mongoose = require('mongoose');
var System = require('./models/system');

const Theme = require('./models/theme');

const async = require('async');

module.exports = new Promise(function(resolve, reject) {

    System.findOne({
        activity: 'fix-theme'
    }).exec(function(err, fix) {

        if (err) {
            throw err;
        }

        if (fix) {            
            resolve(false);
        } else {

            Theme.find()
            .exec(function(err, themes) {

                if (err) {
                    throw err;
                }

                if(themes.length == 0) {

                    let newInstall = new System();
                    newInstall.activity = 'fix-theme';
                    newInstall.save();

                    resolve(true);

                }
                else {

                    async.eachSeries(themes, function (theme, callback) {
                        
                        if(theme.configuration.length == 0 || theme.configuration.length <= 10) {
                            callback();
                        }
                        else {

                            let exceed = theme.configuration.length - 10;

                            for(let i = 0; i < exceed; i++) {
                                theme.configuration.shift();
                            }

                            theme.save((err) => {

                                if (err) {
                                    throw err;
                                }

                                callback();

                            });

                        }

                    }, function (err, results) {

                        if(err) {
                            throw err;
                        }

                        let newInstall = new System();
                        newInstall.activity = 'fix-theme';
                        newInstall.save();

                        resolve(true);

                    });                   

                }

            });


        }

    });

});