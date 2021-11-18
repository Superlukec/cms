var mongoose = require('mongoose');
var System = require('./models/system');

const Post = require('./models/post');
const User = mongoose.model('User');

const async = require('async');

module.exports = new Promise(function(resolve, reject) {

    System.findOne({
        activity: 'fix-users'
    }).exec(function(err, fix) {

        if (err) {
            throw err;
        }

        if (fix) {            
            resolve(false);
        } else {

            User.find()
            .exec(function(err, users) {

                if (err) {
                    throw err;
                }

                if(users.length == 0) {

                    let newInstall = new System();
                    newInstall.activity = 'fix-users';
                    newInstall.save();

                    resolve(true);

                }
                else {

                    Post.find({
                        'user_id': null
                    }).exec(function(err, posts) {

                        if (err) {
                            throw err;
                        }

                        if(users.length > 0) {

                            async.eachSeries(posts, function (post, callback) {

                                post.user_id = users[0]._id;

                                post.save(function(err) {

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
                                newInstall.activity = 'fix-users';
                                newInstall.save();

                                resolve(true);
            
                            });

                        }
                        else {
                            
                            let newInstall = new System();
                            newInstall.activity = 'fix-users';
                            newInstall.save();

                            resolve(true);
                            
                        }

                    });

                }

            });


        }

    });

});