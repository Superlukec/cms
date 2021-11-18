var mongoose = require('mongoose');
var System = require('./models/system');

const Post = require('./models/post');
const User = mongoose.model('User');

const async = require('async');

module.exports = new Promise(function(resolve, reject) {

    System.findOne({
        activity: 'fix-date-post'
    }).exec(function(err, fix) {

        if (err) {
            throw err;
        }

        if (fix) {            
            resolve(false);
        } else {           

            Post.find().exec(function(err, posts) {

                if (err) {
                    throw err;
                }

                if(posts.length > 0) {

                    async.eachSeries(posts, function (post, callback) {

                        post.last_change_user = post.user_id;
                        post.last_change_date = post.date_created;

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
                        newInstall.activity = 'fix-date-post';
                        newInstall.save();

                        resolve(true);

                    });

                }
                else {
                    
                    let newInstall = new System();
                    newInstall.activity = 'fix-date-post';
                    newInstall.save();

                    resolve(true);
                    
                }

            });

        }

    });

});