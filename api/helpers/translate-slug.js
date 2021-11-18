const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const async = require('async');

const Post = require('../models/post');
const Product = require('../models/product');
const Brand = require('../models/brand');
const Property = require('../models/property');
const Category = require('../models/category');

var translate = {

    translatePostSlug: function (models, previousLang, site_id, mainLang) {

        return new Promise(function (resolve, reject) {

            async.eachSeries(models, function (m, callback) {

                let ModelName;

                if (m == 'Post') {
                    ModelName = Post;
                } else if (m == 'Product') {
                    ModelName = Product;
                } else if (m == 'Brand') {
                    ModelName = Brand;
                } else if (m == 'Property') {
                    ModelName = Property;
                } else if (m == 'Category') {
                    ModelName = Category;
                }

                if (!previousLang) {

                    /**
                     * If firstime multilanguage
                     */

                    ModelName.updateMany({
                        site_id: new ObjectId(site_id),
                        lang_prefix: undefined
                    }, {
                        $set: {
                            lang_prefix: mainLang
                        }
                    }).exec(function (err, posts) {

                        if (err) {
                            throw err;
                        }

                        callback();

                    });

                } else {

                    /**
                     * We change the pages (slug) based on the language
                     */

                    ModelName.find({
                        site_id: new ObjectId(site_id)
                    }).exec(function (err, posts) {

                        if (err) {
                            throw err;
                        }

                        if (posts.length == 0) {
                            callback();
                        } else {

                            async function loopThruPosts() {
                                for (let j = 0; j < posts.length; j++) {

                                    await new Promise(resolve2 => {


                                        if (!posts[j].slug) {
                                            resolve2();
                                        }
                                        else {


                                            /**
                                             * We check if it has a lang prefix in the slug
                                             */

                                            let prefixFound = false;
                                            let slug = posts[j].slug.split("/");

                                            if (slug.length > 1) {
                                                if (slug[0] == posts[j].lang_prefix) {
                                                    prefixFound = true;
                                                }
                                            }

                                            if (mainLang == posts[j].lang_prefix) {
                                                /**
                                                 * We remove the lang attribute from the beginning
                                                 */

                                                if (prefixFound) {
                                                    let newSlug = posts[j].slug;
                                                    posts[j].slug = newSlug.replace(posts[j].lang_prefix + "/", "");
                                                    posts[j].save((err) => {
                                                        if (err) {
                                                            throw err;
                                                        }

                                                        resolve2();
                                                    });

                                                } else {
                                                    resolve2();
                                                }

                                            } else {
                                                /**
                                                 * We add the lang attribute to the beginning
                                                 */

                                                if (!prefixFound) {

                                                    posts[j].slug = posts[j].lang_prefix + '/' + posts[j].slug;
                                                    posts[j].save((err) => {
                                                        if (err) {
                                                            throw err;
                                                        }

                                                        resolve2();
                                                    });

                                                } else {
                                                    resolve2();
                                                }

                                            }

                                        }

                                    });

                                }
                            }

                            loopThruPosts().then(function () {

                                callback();

                            });

                        }

                    });

                }


            }, function (err, results) {

                resolve();

            });

        });

    }

}

module.exports = translate;


