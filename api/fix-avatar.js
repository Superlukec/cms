var mongoose = require('mongoose');
var System = require('./models/system');

const User = mongoose.model('User');

const async = require('async');

module.exports = new Promise(function(resolve, reject) {

    System.findOne({
        activity: 'fix-avatar'
    }).exec(function(err, fix) {

        if (err) {
            throw err;
        }

        if (fix) {            
            resolve(false);
        } else {           

            User.find().exec(function(err, users) {

                if (err) {
                    throw err;
                }

                if(users.length > 0) {

                    async.eachSeries(users, function (user, callback) {

                        if(!user.color) {
                            user.color = '#' + Math.floor(Math.random()*16777215).toString(16);
                        }

                        if(user.first_name && user.last_name) {
                            user.initials = user.first_name[0] + user.last_name[0];                        
                        }

                        user.save(function(err) {

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
                        newInstall.activity = 'fix-avatar';
                        newInstall.save();

                        resolve(true);

                    });

                }
                else {
                    
                    let newInstall = new System();
                    newInstall.activity = 'fix-avatar';
                    newInstall.save();

                    resolve(true);
                    
                }

            });

        }

    });

});