const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const uploadMulter = multer({ dest: path.join(__dirname, '../tmp') });
const shareablesMulter = multer({ dest: path.join(__dirname, '../shareables') });

//const easyimg = require('easyimage');
//const sharp = require('sharp');
const async = require('async');
const crypto = require('crypto');

const {
    check,
    validationResult,
    sanitizeParam,
    body
} = require('express-validator');

const logger = require('../helpers/logging')();
const translateHelper = require('../helpers/translate-slug');
const sitemapGenerator = require('../helpers/sitemap-gen');
const settings = require('../config/settings');
const email = require('../email/email.js');
const { manipulatorAddImageSize, manipulatorDifferentSizeGenerator } = require('../helpers/image-manipulator');

const { checkPermission } = require('../authorization/authorizationUtils');
const roles = require('../authorization/roles');
const websocket = require('../websocket');

const User = mongoose.model('User');
const Site = require('../models/site');
const Post = require('../models/post');
const Theme = require('../models/theme');
const Category = require('../models/category');
const Form = require('../models/forms');
const FormSubmit = require('../models/formsubmit');
const File = require('../models/file');
const Brand = require('../models/brand');
const Property = require('../models/property');
const PropertyCategory = require('../models/property.category');
const Product = require('../models/product');
const Shareable = require('../models/shareable');
const DownloadManager = require('../models/download-manager');
const Chat = require('../models/chat');
const file = require('../models/file');
const Template = require('../models/template');

module.exports = router;

// for uploading theme
function minifyCSS(css) {
    return String(css)
        .replace(/\/\*[\s\S]*?\*\//g, ' ') // Comments
        .replace(/\s+/g, ' ') // Extra spaces
        .replace(/([\(\)\{\}\:\;\,]) /g, '$1') // Extra spaces
        .replace(/ \{/g, '{') // Extra spaces
        .replace(/\;\}/g, '}') // Last semicolon
        .replace(/ ([+~>]) /g, '$1') // Extra spaces
        .replace(/([^{][,: \(\)]0)(%|px|pt|pc|rem|em|ex|cm|mm|in)([, };\(\)])/g, '$1$3') // Units for zero values
        .replace(/([: ,=\-\(])0\.(\d)/g, '$1.$2') // Lead zero for float values
        .replace(/([^\}]*\{\s*?\})/g, '') // Empty rules
        .replace(/([,: \(])#([0-9a-f]{6})/gi, function(m, pfx, clr) { // HEX code reducing
            if (clr[0] == clr[1] && clr[2] == clr[3] && clr[4] == clr[5]) return pfx + '#' + clr[0] + clr[2] + clr[4];
            return pfx + '#' + clr;
        });
}

function generateCSSandJS(id, cssfile, jsfile) {

    return new Promise(function(resolve, reject) {

        async.series([
                function(callback) {

                    fs.writeFile(path.join(
                        __dirname,
                        '../../',
                        settings.development ?
                        ('web/src/assets/' + id + '.css') :
                        ('web/dist/browser/assets/' + id + '.css')
                    ), minifyCSS(cssfile), function(err) {

                        if (err) {
                            callback(true, err);
                        } else {
                            callback(null, true);
                        }

                        console.log('The CSS file was saved!');
                    });

                },
                function(callback) {

                    fs.writeFile(path.join(
                        __dirname,
                        '../../',
                        settings.development ?
                        ('web/src/assets/' + id + '.js') :
                        ('web/dist/browser/assets/' + id + '.js')
                    ), jsfile, function(err) {

                        if (err) {
                            callback(true, err);
                        } else {
                            callback(null, true);
                        }

                        console.log('The JS file was saved!');
                    });

                }
            ],
            function(err, data) {

                if (err) {
                    reject(data)
                } else {
                    resolve(data)
                }

            }

        );
    });

}

function deleteCSSandJS(id) {

    fs.unlinkSync(path.join(
        __dirname,
        '../../',
        settings.development ?
        ('web/src/assets/' + id + '.css') :
        ('web/dist/browser/assets/' + id + '.css')
    ));

    fs.unlinkSync(path.join(
        __dirname,
        '../../',
        settings.development ?
        ('web/src/assets/' + id + '.js') :
        ('web/dist/browser/assets/' + id + '.js')
    ));

}

router.post('/post', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('slug').not().isEmpty().trim(),
    check('type').not().isEmpty().trim().escape(),
    check('title').not().isEmpty().trim(),
    check('lang').trim().escape(),
    body('blocks').custom((item) => Array.isArray(item)),
    check('featured_image').trim().escape(),
    check('meta'),
], addPost);

router.put('/update/post', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    sanitizeParam('id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('slug').not().isEmpty().trim(),
    check('title').not().isEmpty().trim(),
    check('lang').trim().escape(),
    body('blocks').custom((item) => Array.isArray(item)),
    check('featured_image').trim().escape(),
    check('meta'),
], updatePostContent);

router.put('/template/:id', [
    check('slug').not().isEmpty(),
    check('themeId').optional({ checkNull: true }),
    check('themeVersion').optional({ checkNull: true }),
], getSiteTemplate);

router.get('/pages/list/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getAllPagesList);

router.get('/pages/list/:id/:lang', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getAllPagesList);

router.post('/menu', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    check('id').not().isEmpty().trim().escape(),
    check('name').not().isEmpty().trim().escape(),
    check('slug').not().isEmpty().trim().escape()
], addMenu);

router.get('/menu/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
], getAllMenu);

router.post('/menu/pages', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    check('id').not().isEmpty().trim().escape(),
    body('menus').custom((item) => Array.isArray(item))
], addMenuPages);

router.post('/show/links', [
    passport.authenticate('jwt', {
        session: false
    }),
    check('site_id').not().isEmpty().trim().escape(),
    check('id').not().isEmpty().trim().escape(),
], showLinksChild);

router.post('/add/theme', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    check('id').not().isEmpty().trim().escape(),
    check('name').not().isEmpty().trim().escape(),
    check('description').not().isEmpty().trim().escape(),
    check('header').not().isEmpty().trim(),
    check('footer').not().isEmpty().trim(),
    check('css').trim().escape(),
    check('jsfile').trim().escape()
], addTheme);

router.put('/update/theme/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    check('site_id').not().isEmpty().trim().escape(),
    check('name').not().isEmpty().trim().escape(),
    check('description').not().isEmpty().trim().escape(),
    check('header').not().isEmpty().trim(),
    check('footer').not().isEmpty().trim(),
    check('css'),
    check('jsfile')
], updateTheme);

router.get('/themes/installed/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], getInstalled);

router.get('/themes/market/get', passport.authenticate('jwt', {
    session: false
}), getFromMarket);

router.get('/themes/specific/:id', passport.authenticate('jwt', {
    session: false
}), getSpecificTheme);

router.put('/themes/select/:siteid/:themeid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], selectTheme);

router.delete('/themes/:siteid/:themeid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], deleteTheme);

router.put('/resolve', [
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('slug').trim()
], resolvePage);

router.delete('/menu/delete/:siteid/:menuid', [
    passport.authenticate('jwt', {
        session: false
    }),
    check('slug').trim().escape()
], deleteMenu);

router.post('/host', [
    check('host').not().isEmpty()
], resolveHost);

router.get('/get/users/:siteid', [
    passport.authenticate('jwt', {
        session: false
    })
], getUsers);

router.get('/get/users/shareable/:siteid', [
    passport.authenticate('jwt', {
        session: false
    })
], getShareableUsers);

router.get('/get/profile', [
    passport.authenticate('jwt', {
        session: false
    })
], getUserProfile);

router.post('/update/profile', [
    passport.authenticate('jwt', {
        session: false
    }),
    check('email').not().isEmpty().trim().escape(),
    check('first_name').not().isEmpty().trim().escape(),
    check('last_name').not().isEmpty().trim().escape(),
    check('full_name').not().isEmpty().trim().escape(),
    check('color').not().isEmpty().trim(),
    check('password')
], updateUserProfile);

router.get('/get/user/:siteid/:userid', [
    passport.authenticate('jwt', {
        session: false
    })
], getUser);

/**
 * User
 */

router.post('/add/user', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('registrationType').not().isEmpty().trim().escape(),
    check('email').not().isEmpty().trim().escape().isEmail(),
    check('role').not().isEmpty().isFloat({ min: 0, max: 5 }),
    check('first_name').not().isEmpty().trim().escape(),
    check('last_name').not().isEmpty().trim().escape(),
    check('full_name').not().isEmpty().trim().escape(),
    check('company').trim().escape(),
    check('password').optional({ checkNull: true }),
    check('message').trim().escape(),
    check('no_email').optional({ checkFalsy: true })
], addUser);

router.put('/update/user/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('email').not().isEmpty().trim().escape().isEmail(),
    check('role').not().isEmpty().isFloat({ min: 0, max: 5 }),
    check('first_name').not().isEmpty().trim().escape(),
    check('last_name').not().isEmpty().trim().escape(),
    check('full_name').not().isEmpty().trim().escape(),
    check('company').trim().escape(),
    check('password').optional({ checkNull: true }),
    check('no_email').optional({ checkFalsy: true })
], updateUser);

router.delete('/delete/user/:siteid/:userid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], deleteUser);

router.get('/categories/:site_id/:lang', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getCategories);

router.post('/category', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim().escape(),
    check('slug').not().isEmpty().trim().escape(),
    check('lang').trim()
], addCategory);

router.get('/category/:siteid/:categoryid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getCategory);

router.put('/update/category/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim().escape(),
    check('slug').not().isEmpty().trim().escape(),
    check('lang').trim()
], updateCategory);

router.delete('/category/delete/:siteid/:catid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
    check('slug').trim().escape()
], deleteCategory);

/**
 * Uploading images for web assets
 */
router.post('/upload/image', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
    uploadMulter.any(),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('favicon').trim().escape()
], uploadImage);

/**
 * Upload asset
 */
router.post('/upload/asset', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR]),
    uploadMulter.any(),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    })
], uploadAsset);

/**
 * Uploading shareables
 */
router.post('/upload/shareable', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.EXCHANGE]),
    shareablesMulter.any()
], uploadShareable);

router.put('/file/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.EXCHANGE]),
    check('public').not().isEmpty().isBoolean(),
    check('image').trim().escape(),
    check('transfer').trim().escape(),
    check('offset').trim(),
    check('index').trim(),
    check('size').trim(),
    check('sort').trim(),
    check('direction').trim()
], getFiles)

router.delete('/file/delete/:siteid/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.EXCHANGE])
], deleteFile)

router.delete('/file/safe/delete/:siteid/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.EXCHANGE])
], safeDeleteFile)

router.delete('/file/delete/n/:siteid/:filename', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.EXCHANGE])
], deleteFileByName)

router.get('/file/total/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], adminTotalFiles);

router.delete('/file/broken/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], adminDeleteBrokenLinks);

router.get('/file/total/shareable/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], adminTotalShareable);


router.get('/file/show/unused/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], adminShowUnusedFiles);

/*
router.delete('/file/delete/unused/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], adminDeleteUnusedFiles);*/

router.post('/add/language', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim().escape(),
    check('prefix').not().isEmpty().trim().escape()
], addLanguage);

router.post('/add/image/size', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim().escape(),
    check('width').not().isEmpty().isNumeric(),
    check('height'),
    check('algorithm').not().isEmpty().trim().escape()
], addImageSize);

router.post('/generate/image/size', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    })
], regenerateImageSizes);

router.delete('/image/size/delete/:siteid/:position', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], deleteImageSize);

router.get('/post/info/:site_id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getPostSiteInfo);

router.get('/setting/info/:site_id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN])
], getSettingsSiteInfo);

router.put('/update/settings/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    check('title').not().isEmpty().trim().escape(),
    check('domain').not().isEmpty().trim().escape(),
    check('public').not().isEmpty().trim().escape(),
    check('seo').not().isEmpty().trim().escape(),
    check('multilanguage').not().isEmpty().trim().escape(),
    check('sitemap_enabled').not().isEmpty().trim().escape(),
    body('languages').custom((item) => Array.isArray(item))
], updateSiteSettings);

router.get('/product/setting/info/:site_id', getProductSiteSettings); // public

router.put('/product/update/settings/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR]),
    check('show_form').not().isEmpty().trim().escape(),
    check('form_id').trim().escape()
], updateProductSiteSettings);

router.post('/form', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR]),
    check('name').not().isEmpty().trim().escape(),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    body('elements').custom((item) => Array.isArray(item)),
    check('submit_btn').trim().escape(),
    check('html')
], addForm);

router.put('/form/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR]),
    check('name').not().isEmpty().trim().escape(),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    body('elements').custom((item) => Array.isArray(item)),
    check('submit_btn').trim().escape(),
    check('html')
], updateForm);

router.delete('/form/delete/:siteid/:formid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR])
], deleteForm);

router.get('/form/p/:siteid/:formid', getFormPublic);

router.post('/form/p', [
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    sanitizeParam('form_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('data').custom((item) => (typeof item === 'object')),
    check('location').trim()
], postFormPublic);


router.get('/forms/submissions/:siteid/:formid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR])
], getFormsSubmissions);

router.delete('/forms/submissions/:siteid/:formid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR])
], deleteFormsSubmissions);

router.get('/form/:siteid/:formid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR])
], getForm);

router.get('/forms/:site_id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR])
], getForms);

router.get('/forms/:site_id/:lang', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR])
], getForms);

router.delete('/post/delete/:siteid/:postid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
    check('slug').trim().escape()
], deletePost);

router.get('/pages/:site_id/:lang/:offset/:index/:size/:sort/:direction', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getPosts);

router.get('/posts/:site_id/:lang/:offset/:index/:size/:sort/:direction', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getPosts);

//#region archive
router.delete('/archive/empty/:type/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
], emptyArchive);

router.delete('/archive/:siteid/:postid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
], archivePost);

router.delete('/archive/perm/:siteid/:postid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
], permanentlyDelete);

router.delete('/archive/restore/:siteid/:postid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
], restorePost);

router.get('/archive/:type/:site_id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getArchivePosts);
//#endregion

router.get('/post/p/:site_id/:cat_id/:limit', getCategoryPostsPublic);


/**
 * Brands
 */
router.get('/get/brand/:siteid/:lang', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getBrands);


router.post('/brand/order', [
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    sanitizeParam('brand_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('sort_number'),
], saveBrandOrder);

router.post('/add/brand', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim(),
    check('description').not().isEmpty().trim(),
    check('logo'),
    check('lang').trim(),
], addBrand);

router.put('/update/brand/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim(),
    check('description').not().isEmpty().trim(),
    check('logo'),
    check('lang').trim(),
], updateBrand);

router.delete('/delete/brand/:siteid/:brandid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], deleteBrand);

/**
 * Products
 */
/*
router.get('/get/product/:siteid', [
    passport.authenticate('jwt', {
        session: false
    })
], getProducts);*/

router.get('/get/products/:siteid/:lang/:brand/:offset/:index/:size/:sort/:direction', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getProducts);

router.post('/product/order', [
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    sanitizeParam('product_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('sort_number'),
], saveProductOrder);

router.post('/get/p/products/brand/:siteid', [
    check('brands'),
    check('limit')
], getBrandProducts);

router.post('/filter/products', [
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('brands'),
    check('filter')
], getBrandFilterProducts);

router.get('/get/product/:siteid/:productid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getProduct);

router.get('/get/products/hierarchy/:siteid/:brandid/:productid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getProductHierarchy);

router.post('/add/product', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim(),
    check('brand_id').not().isEmpty().trim(),
    check('description').not().isEmpty().trim(),
    check('parent_id').not().isEmpty().trim(),
    check('slug').not().isEmpty().trim(),
    check('excerpt').not().isEmpty().trim(),
    check('features'),
    check('images'),
    check('attachments'),
    check('properties'),
    check('meta_keywords'),
    check('meta_description'),
    check('lang').trim()
], addProduct);

router.put('/update/product/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim(),
    check('brand_id').not().isEmpty().trim(),
    check('description').not().isEmpty().trim(),
    check('parent_id').not().isEmpty().trim(),
    check('slug').not().isEmpty().trim(),
    check('excerpt').not().isEmpty().trim(),
    check('features'),
    check('images'),
    check('attachments'),
    check('properties'),
    check('meta_keywords'),
    check('meta_description'),
    check('lang').trim()
], updateProduct);

router.delete('/delete/product/:siteid/:productid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], deleteProduct);

/**
 * Properties
 */

router.get('/get/properties/:siteid/:lang', getProperties);

router.post('/add/properties', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim().escape(),
    check('lang').trim(),
    check('category')
], addProperty);

router.put('/update/properties/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim().escape(),
    check('lang').trim(),
    check('category')
], updateProperty);

router.delete('/delete/properties/:siteid/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR])
], deleteProperty);

router.get('/get/category/properties/:siteid/:lang', getCatProperties);

router.post('/add/category/properties', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim().escape(),
    check('lang').trim()
], addCatProperty);

router.put('/update/category/properties/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim().escape(),
    check('lang').trim()
], updateCatProperty);

router.delete('/delete/category/properties/:siteid/:id', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR])
], deleteCatProperty);


/**
 * Under construction - info
 */
router.get('/construction/info/:siteid', underConstructionInfo);

router.get('/get/post/children/:siteid/:postid', getPostChildren);

/**
 * Shareables
 */
router.post('/add/shareable', [
    passport.authenticate('jwt', {
        session: false
    }),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR]),
    check('name').not().isEmpty().trim().escape(),
    check('duration').not().isEmpty().trim(),
    check('limitDownload').not().isEmpty().trim(),
    check('limitAccess').not().isEmpty().trim(),
    //check('password').not().isEmpty(),
    check('durationTime'),
    check('downloadNumber'),
    check('access'),
    check('files'),
    check('sendEmail')
], addShareable);

router.put('/update/shareable', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR]),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    sanitizeParam('id').customSanitizer(value => {
        return ObjectId(value);
    }),
    check('name').not().isEmpty().trim().escape(),
    check('duration').not().isEmpty().trim(),
    check('limitDownload').not().isEmpty().trim(),
    check('limitAccess').not().isEmpty().trim(),
    //check('password').not().isEmpty(),
    check('durationTime'),
    check('downloadNumber'),
    check('access'),
    check('files'),
    check('sendEmail')
], updateShareable);

router.get('/get/shareables/:siteid/:lang', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR])
], getShareables);

router.get('/get/shareable/:siteid/:shareableid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR])
], getShareable);

router.delete('/delete/shareable/:siteid/:shareableid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR])
], deleteShareable);

/**
 * Cookies
 */

router.put('/cookie/settings', [
    passport.authenticate('jwt', {
        session: false
    }),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    check('cookies_enabled').not().isEmpty().trim().escape(),
    check('cookies')
], updateCookieSettings);

/**
 * Get system version
 */
router.get('/get/version', [
    passport.authenticate('jwt', {
        session: false
    })
], getSystemVersion);

/**
 * Get system font awesome icons
 */
router.get('/get/fa/icons', [
    passport.authenticate('jwt', {
        session: false
    })
], getSystemFaIcons);

/**
 * Google Maps API
 */
router.get('/get/google-maps/:siteid', getGoogleMapsAPI);

router.put('/update/google-maps', [
    passport.authenticate('jwt', {
        session: false
    }),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    check('api').not().isEmpty().trim().escape()
], updateGoogleMapsAPI);

/**
 * Google Analytics API
 */
router.get('/get/google-analytics/:siteid', getGoogleAnalyticsAPI);

router.put('/update/google-analytics', [
    passport.authenticate('jwt', {
        session: false
    }),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    check('api').not().isEmpty().trim().escape()
], updateGoogleAnalyticsAPI);

/**
 * Chatbot settings
 */
router.get('/get/chatbot-settings/:siteid', getChatbotSettings);

router.put('/update/chatbot-settings', [
    passport.authenticate('jwt', {
        session: false
    }),
    sanitizeParam('site_id').customSanitizer(value => {
        return ObjectId(value);
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN]),
    check('chat_enabled').not().isEmpty().trim().escape(),
    check('text_data'),
    check('working_hours_enabled').not().isEmpty().trim().escape(),
    check('working_hours_type'),
    check('working_hours')
], updateChatBotSettings);


router.get('/prepare/:siteid/:id', [
    passport.authenticate('jwt', {
        session: false
    })
], prepareTransferFile);


router.get('/get/stats/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getDashStats);

router.get('/get/active/users/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getActiveUsers);

/**
 * Chatting
 */
router.get('/get/chat/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], getChats);

router.get('/get/chat/:siteid/:chatid', getChat);

router.delete('/delete/chat/:siteid/:chatid', [
    passport.authenticate('jwt', {
        session: false
    })
], deleteChat);

/**
 * CKeditor link
 */
router.get('/search/link/:siteid', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], searchPosts);

router.get('/search/link/:siteid/:search', [
    passport.authenticate('jwt', {
        session: false
    }),
    checkPermission([roles.SUPER_ADMIN, roles.ADMIN, roles.EDITOR, roles.AUTHOR])
], searchPosts);

/**
 * Get block info - page editing
 */
router.get('/get/block/data/:siteid/:postid/:blockid', getBlockInfo);
router.get('/get/block/data/:siteid/:postid/:blockid/:childid', getBlockInfo);

/**
 * The following routes need to be at the end
 */

router.get('/:type/:site_id/:id', passport.authenticate('jwt', {
    session: false
}), getSpecificPosts);

/** DO NOT WRITE ROUTES UNDER THIS SECTION **/


/**
 * Reading HTML file of element
 * @param {*} path 
 * @param {*} callback 
 */
function readHtmlFile(path) {
    return new Promise(function(resolve, reject) {

        fs.readFile(path, {
            encoding: 'utf-8'
        }, function(err, html) {
            if (err) {
                reject(err);
            } else {
                resolve(html);
            }
        });

    });
}

/**
 * Generate HTML
 * @param {*} blocks 
 */
function generateHTML(post_id, blocks) {
    return new Promise(function(resolve, reject) {

        if (blocks && blocks.length > 0) {

            var html = '';
            var blockOptions;

            async function loopThruParentBlock() {
                for (let i = 0; i < blocks.length; i++) {
                    await new Promise(resolve2 => {

                        blockOptions = (blocks[i].options) ? blocks[i].options : {};

                        let layoutClass = '';

                        if (blockOptions.background_color || blockOptions.background_image || blockOptions.layout_class) {

                            let background_color = ((blockOptions.background_color) ? blockOptions.background_color : '')
                            let background_image = ((blockOptions.background_image) ? blockOptions.background_image : '');

                            html += '<div style="background: ' + background_color;

                            if (background_image) {
                                html += '; background-image: url(' + background_image + ')';

                                if (blockOptions.background_style) {

                                    if (blockOptions.background_style == 'repeat') {
                                        html += '; background-repeat: repeat';
                                    } else if (blockOptions.background_style == 'cover') {
                                        html += '; background-size: cover';
                                    } else {
                                        html += '; background-repeat: no-repeat';
                                    }

                                }

                            }

                            html += '">';

                            layoutClass = (blockOptions.layout_class) ? blockOptions.layout_class : '';

                        }

                        let _containerClass = 'container'; //(blockOptions.layout == 'full-width') ? 'container-fluid' : 'container';

                        // fullwidth
                        if (blockOptions.layout == 'full-width') {
                            _containerClass = 'container-fluid';
                        }

                        // narrow
                        if (blockOptions.layout == 'container-narrow') {
                            _containerClass += ' ' + 'container-narrow';
                        }


                        html += '<div class="' + _containerClass + ' ' + layoutClass + '">';

                        if (blocks[i].type != 'columns') {

                            // templates
                            async.series([
                                    function(templateCallback) {

                                        if (blocks[i].type != 'template') {
                                            templateCallback(false, null);
                                        } else {

                                            if (blocks[i].options.template && blocks[i].options.template.template_id) {

                                                Template.findOne({
                                                    _id: new ObjectId(blocks[i].options.template.template_id)
                                                }).exec(function(err, template) {

                                                    if (err) {
                                                        logger.log({
                                                            level: 'error',
                                                            message: 'Mongo - error',
                                                            context: __filename,
                                                            details: `stderr: ${err}`,
                                                        });

                                                        throw err;
                                                    }

                                                    if (!template) {
                                                        templateCallback(false, null);
                                                    } else {

                                                        let templateHeader = handlebars.compile(template.html);
                                                        let templateData = {};

                                                        if (blocks[i].options.template.fields && blocks[i].options.template.fields.length > 0) {

                                                            for (let f = 0; f < blocks[i].options.template.fields.length; f++) {
                                                                templateData[blocks[i].options.template.fields[f].name] = blocks[i].options.template.fields[f].value;
                                                            }

                                                        }

                                                        let compiledHtml = null;

                                                        try {

                                                            compiledHtml = templateHeader(templateData);
                                                            templateCallback(false, compiledHtml);

                                                        } catch (err) {

                                                            logger.log({
                                                                level: 'error',
                                                                message: 'Template - error',
                                                                context: __filename,
                                                                details: `stderr: ${err}`,
                                                            });

                                                            templateCallback(false, compiledHtml);
                                                        }

                                                    }

                                                });

                                            } else {
                                                templateCallback(false, null);
                                            }

                                        }

                                    }
                                ],
                                function(err, result) {

                                    
                                    if (result[0]) {
                                        blocks[i].value = result[0];
                                    }

                                    /**
                                     * If block is not columns
                                     */
                                    let generatedHtml = '';

                                    readHtmlFile(path.join(__dirname, '../', 'elements/' + blocks[i].type + '.html')).then(function(htmlFile) {

                                        let value = blocks[i].value;
                                                                                
                                        //#region image resize
                                        if(blocks[i].type == 'image' && value) {
                                            if(blockOptions.img_size) {
                                                let tmp = value.split('.');
                                                value = tmp[0] + '_' + blockOptions.img_size + '.' + tmp[1];
                                            }
                                        }                     
                                        //#endregion  


                                        let template = handlebars.compile(htmlFile);
                                        
                                        generatedHtml = template({
                                            post_id: post_id,
                                            block_id: i,
                                            value: value,
                                            options: blockOptions // (blocks[i].options) ? blocks[i].options : {}
                                        });

                                        html += generatedHtml;

                                        resolve2(generatedHtml);

                                    }, function(err) {

                                        resolve2(true);

                                    });

                                });


                        } else {

                            html += '<div class="row my-2">';

                            // let widthOfColumn = 12 / parseInt(blocks[i].no_columns);
                            let innerBlocks = (blocks[i].blocks) ? blocks[i].blocks : [];


                            async function loopThruChildBlocks() {
                                for (let j = 0; j < innerBlocks.length; j++) {
                                    await new Promise(resolve3 => {

                                        readHtmlFile(path.join(__dirname, '../', 'elements/' + innerBlocks[j].type + '.html')).then(function(htmlFile) {

                                            // html += '<div class="col-12 col-lg-' + widthOfColumn + '">';

                                            let defaultWidth = 'col-md';
                                            let backgroundColor = '';

                                            if (innerBlocks[j].options) {

                                                if (innerBlocks[j].options.column_width) {
                                                    defaultWidth = innerBlocks[j].options.column_width;
                                                }                                               

                                                if (innerBlocks[j].options.background_color) {
                                                    backgroundColor = innerBlocks[j].options.background_color;
                                                }

                                            }

                                            html += '<div class="col-12 ' + defaultWidth + '" ' + ((backgroundColor) ? ' style="background: ' + backgroundColor + '"' : '') + '>';

                                            let template = handlebars.compile(htmlFile);

                                            let value = innerBlocks[j].value;

                                            //#region image resize
                                            if(innerBlocks[j].type == 'image' && value) {
                                                if (innerBlocks[j].options 
                                                    && innerBlocks[j].options.img_size) {                                                        
                                                        let tmp = value.split('.');
                                                        value = tmp[0] + '_' + innerBlocks[j].options.img_size + '.' + tmp[1];
                                                }                                               
                                            }                     
                                            //#endregion


                                            generatedHtml = template({
                                                post_id: post_id,
                                                block_id: i,
                                                child_id: j,
                                                value: value,
                                                options: (innerBlocks[j].options) ? innerBlocks[j].options : {}
                                            });

                                            html += generatedHtml;

                                            html += '</div>';

                                            resolve3(generatedHtml)

                                        }, function(err) {

                                            resolve3();

                                        });

                                    });
                                }
                            }

                            loopThruChildBlocks().then(function() {

                                // <!-- .row my-2 -->
                                html += '</div>';


                                resolve2(html);

                            });

                        }

                    });

                    // <!-- .container -->
                    html += '</div>';

                    if (blockOptions && (blockOptions.background_color || blockOptions.layout_class)) {

                        // <!-- #rgb background -->
                        html += '</div>';

                    }
                }
            }

            loopThruParentBlock().then(function() {

                resolve(html);

            });

        } else {
            /**
             * If no data, then we don't generate HTML
             */
            resolve('');
        }


    });
}

/**
 * Function for adding the post
 * @param {*} res 
 * @param {*} next 
 */
function addPost(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    if(inData.type != 'post' && inData.type != 'page') {
        return res.status(422).json({
            success: false
        });
    }

    var post = new Post();
    post.site_id = inData.site_id;
    post.title = inData.title;
    post.slug = inData.slug;
    post.type = inData.type;
    post.user_id = new ObjectId(req.user._id);
    post.lang_prefix = (inData.lang) ? inData.lang : null;

    if (inData.featured_image) {
        post.featured_image = inData.featured_image;
    }

    if (inData.meta) {
        if (inData.meta.categories) {

            let categories = inData.meta.categories;
            let checkID = new RegExp('^[0-9a-fA-F]{24}$');

            post.category_id = [];

            for (let i = 0; i < categories.length; i++) {

                if (categories[i] && checkID.test(categories[i])) {

                    post.category_id.push(new ObjectId(categories[i]));

                }

            }

        }

        //#region 

        /**
         * META data
         */

        if (inData.meta.meta_keywords != null) {
            post.meta_keywords = inData.meta.meta_keywords;
        }

        if (inData.meta.meta_description != null) {
            post.meta_description = inData.meta.meta_description;
        }

        //#endregion

        //#region 

        /*
         * Redirect management
         */
        if (inData.meta.redirect != null) {
            post.redirect = inData.meta.redirect;

            if (post.redirect) {

                if (inData.meta.redirect_url) {
                    post.redirect_url = inData.meta.redirect_url;
                } else {
                    post.redirect = false;
                }

            }

        }
        //#endregion

        //#region  

        /**
         * Private page
         */
        if (inData.meta.private_page != null) {
            post.private_page = inData.meta.private_page;

            if (post.private_page) {

                if (inData.meta.private_page) {
                    post.private_page = inData.meta.private_page;
                } else {
                    post.private_page = false;
                }

            }

        }
        //#endregion
    }

    post.blocks = [];

    for (let i = 0; i < inData.blocks.length; i++) {

        let blocks = undefined;

        if(inData.blocks[i].type) {

            post.blocks.push({
                type: inData.blocks[i].type,
                value: inData.blocks[i].value,
                options: (inData.blocks[i].options) ? inData.blocks[i].options : null,
                blocks: []
            });

            if (inData.blocks[i].blocks && inData.blocks[i].blocks.length > 0) {
                /**
                 * Sub elements
                 */

                blocks = [];

                for (let j = 0; j < inData.blocks[i].blocks.length; j++) {

                    post.blocks[i].blocks.push({
                        type: inData.blocks[i].blocks[j].type,
                        value: inData.blocks[i].blocks[j].value,
                        options: (inData.blocks[i].blocks[j].options) ? inData.blocks[i].blocks[j].options : null
                    });

                }


                post.blocks[i].no_columns = post.blocks[i].blocks.length;

            }
        }

    }

    //post.meta = (inData.meta);

    /**
     * We generate the HTML code
     */
    generateHTML(post._id.toString(), inData.blocks).then(function(html) {

        post.html = html;
        post.version = 1;

        // we add to the backup
        if (!post.backup) {
            post.backup = [];
        }

        post.backup.push({
            version: post.version,
            blocks: post.blocks,
            html: post.html
        });

        post.save(function(err) {

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
                data: post._id
            });

        });

    });

}

/**
 * Function for updating the post content
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function updatePostContent(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    var id = inData.id;

    var checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (inData.site_id && checkID.test(inData.site_id))) {

        Post.findOne({
                _id: new ObjectId(id),
                site_id: new ObjectId(inData.site_id),
            })
            .exec(function(err, post) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (post) {

                    post.title = inData.title;
                    post.slug = inData.slug;
                    post.homepage = (inData.homepage == true || inData.homepage == 'true') ? true : false;
                    post.lang_prefix = (inData.lang) ? inData.lang : 'main';
                    post.last_change_user = new ObjectId(req.user._id);
                    post.last_change_date = Date.now();

                    if (inData.featured_image && checkID.test(inData.featured_image)) {
                        post.featured_image = inData.featured_image;
                    } else {
                        post.featured_image = null;
                    }

                    if (inData.meta) {
                        if (inData.meta.categories) {

                            let categories = inData.meta.categories;
                            let checkID = new RegExp('^[0-9a-fA-F]{24}$');

                            post.category_id = [];

                            for (let i = 0; i < categories.length; i++) {

                                if (categories[i] && checkID.test(categories[i])) {

                                    post.category_id.push(new ObjectId(categories[i]));

                                }

                            }

                        }

                        //#region 

                        /**
                         * META data
                         */

                        if (inData.meta.meta_keywords != null) {
                            post.meta_keywords = inData.meta.meta_keywords;
                        }

                        if (inData.meta.meta_description != null) {
                            post.meta_description = inData.meta.meta_description;
                        }

                        //#endregion


                        //#region 

                        /*
                         * Redirect management
                         */
                        if (inData.meta.redirect != null) {
                            post.redirect = inData.meta.redirect;

                            if (post.redirect) {

                                if (inData.meta.redirect_url) {
                                    post.redirect_url = inData.meta.redirect_url;
                                } else {
                                    post.redirect = false;
                                }

                            }

                        }

                        //#endregion


                        //#region  

                        /**
                         * Private page
                         */
                        if (inData.meta.private_page != null) {
                            post.private_page = inData.meta.private_page;

                            if (post.private_page) {

                                if (inData.meta.private_page) {
                                    post.private_page = inData.meta.private_page;
                                } else {
                                    post.private_page = false;
                                }

                            }

                        }
                        //#endregion

                    }

                    post.blocks = [];

                    for (let i = 0; i < inData.blocks.length; i++) {

                        if(inData.blocks[i].type) {

                            let blocks = undefined;

                            post.blocks.push({
                                type: inData.blocks[i].type,
                                value: inData.blocks[i].value,
                                options: (inData.blocks[i].options) ? inData.blocks[i].options : null,
                                blocks: []
                            });

                            if (inData.blocks[i].blocks && inData.blocks[i].blocks.length > 0) {
                                /**
                                 * Sub elements
                                 */

                                blocks = [];

                                for (let j = 0; j < inData.blocks[i].blocks.length; j++) {

                                    if (!post.blocks[i].blocks) {
                                        post.blocks[i].blocks = [];
                                    }

                                    post.blocks[i].blocks.push({
                                        type: inData.blocks[i].blocks[j].type,
                                        value: inData.blocks[i].blocks[j].value,
                                        options: (inData.blocks[i].blocks[j].options) ? inData.blocks[i].blocks[j].options : null
                                    });

                                }


                                post.blocks[i].no_columns = post.blocks[i].blocks.length;

                            }

                        }

                    }

                    //post.meta = inData.meta;

                    /**
                     * We generate the HTML code
                     */
                    generateHTML(post._id.toString(), inData.blocks).then(function(html) {

                        post.html = html;

                        // we add to the backup
                        if (!post.backup) {
                            post.backup = [];
                        }

                        let backupChanged = false;

                        if (inData.meta) {
                            if (inData.meta.backup_changed != null) {

                                if ((inData.meta.backup_version != null) && (!isNaN(inData.meta.backup_version))) {
                                    post.version = parseInt(post.backup[inData.meta.backup_version].version) - 1;
                                    backupChanged = true;
                                }

                            }
                        }

                        if (backupChanged) {

                            let backupNumberLength = post.backup.length;

                            for (let i = parseInt(inData.meta.backup_version); i < backupNumberLength; i++) {

                                post.backup.pop();

                            }

                        } else {
                            post.backup.push({
                                version: post.version + 1,
                                blocks: post.blocks,
                                html: post.html
                            });

                            if (post.backup.length > 10) {
                                post.backup.shift();
                            }



                            post.version = post.version + 1;
                        }



                        post.save(function(err) {

                            if (err) {
                                logger.log({
                                    level: 'error',
                                    message: 'Mongo - error',
                                    context: __filename,
                                    details: `stderr: ${err}`,
                                });

                                throw err;
                            }

                            if (post.homepage) {

                                Post.updateOne({
                                    _id: {
                                        $ne: post._id.toString()
                                    },
                                    site_id: new ObjectId(inData.site_id),
                                    homepage: true
                                }, {
                                    $set: {
                                        homepage: false
                                    }
                                }, {
                                    multi: true
                                }).exec(function(err, data) {

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
                                        success: true
                                    });

                                });

                            } else {
                                return res.send({
                                    success: true
                                });
                            }

                        });

                    });

                } else {
                    res.sendStatus(401);
                }

            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Get posts from specific page
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getPosts(req, res, next) {

    let routeResolve = req.route.path;
    let tmp = routeResolve.split('/');

    let type = (tmp[1] == 'pages') ? 'page' : 'post'; // page | post

    let lang = req.params.lang;
    let langRestrict = false;

    if (lang != 'undefined') {
        langRestrict = !(lang == 'all');
    }

    let site_id = req.params.site_id;

    //#region we setup params
    let offset = 0;
    let index = 0;
    let size = 0;
    let sort = false;
    let direction = false;

    if (!isNaN(req.params.offset)) {
        offset = parseInt(req.params.offset);
    }

    if (!isNaN(req.params.index)) {
        index = parseInt(req.params.index);
    }

    if (!isNaN(req.params.size)) {
        size = parseInt(req.params.size);
    }

    if (req.params.sort != 'undefined') {
        sort = req.params.sort;
    }

    if (req.params.direction != 'undefined') {
        direction = req.params.direction;
    }
    //#endregion    

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (site_id && checkID.test(site_id)) {

        let query = {
            type: type,
            deleted: false,
            site_id: site_id
        };

        if (langRestrict) {
            query['lang_prefix'] = lang;
        }

        Post.countDocuments(query).exec(function(err, postNumber) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            let defaultSort = {
                date_created: -1
            }

            if (sort && direction) {
                defaultSort = {};
                defaultSort[sort] = (direction == 'asc') ? 1 : -1;
            }

            Post.find(query)
                .skip(index * size)
                .limit(size)
                .populate('user_id')
                .sort(defaultSort)
                .exec(function(err, posts) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }

                    res.send({
                        success: true,
                        data: posts,
                        count: postNumber
                    });

                });

        });

    } else {
        res.sendStatus(401);
    }

}

function getArchivePosts(req, res, next) {

    let site_id = req.params.site_id;
    let type = (req.params.type == 'pages') ? 'page' : 'post';

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (site_id && checkID.test(site_id)) {

        let query = {
            type: type,
            deleted: true,
            site_id: site_id
        };

        Post.countDocuments(query).exec(function(err, postNumber) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            Post.find(query)
                .populate('user_id')
                .sort({
                    date_created: -1
                })
                .exec(function(err, posts) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }

                    res.send({
                        success: true,
                        data: posts,
                        count: postNumber
                    });

                });

        });


    } else {
        res.sendStatus(401);
    }

}

function getCategoryPostsPublic(req, res, next) {

    let site_id = req.params.site_id;
    let cat_id = req.params.cat_id;
    let limit = req.params.limit;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((site_id && checkID.test(site_id)) &&
        (cat_id && checkID.test(cat_id)) &&
        !isNaN(limit)) {


        Post.find({
                type: 'post',
                site_id: site_id,
                category_id: cat_id
            })
            .populate('user_id featured_image')
            .sort({
                date_created: -1
            })
            .limit(parseInt(limit))
            .exec(function(err, posts) {

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
                    data: posts
                });

            });

    } else {
        return res.sendStatus(401);
    }

}

/**
 * Get specific post
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getSpecificPosts(req, res, next) {

    let type = (req.params.type) ? req.params.type : 'page';
    let id = req.params.id;
    let site_id = req.params.site_id;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (site_id && checkID.test(site_id))) {

        Post.findOne({
                type: type,
                _id: new ObjectId(id),
                site_id: site_id
            })
            .populate('user_id')
            .populate('blocks.options.gallery.image')
            .populate('blocks.blocks.options.gallery.image')
            .populate('blocks.options.custom_filter.category')
            .populate('blocks.blocks.options.custom_filter.category')
            .populate('blocks.options.custom_filter.property')
            .populate('blocks.blocks.options.custom_filter.property')
            .populate('featured_image')
            .exec(function(err, post) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (post) {

                    res.send({
                        success: true,
                        data: post
                    });

                } else {

                    res.send({
                        success: false
                    });

                }

            });

    } else {
        res.sendStatus(401);
    }
}

/**
 * Resolve page form url
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function resolvePage(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    let query = {};

    if (inData.slug == '') {
        /**
         * We show homepage
         */
        query = {
            site_id: inData.site_id,
            homepage: true
        };
    } else {
        /**
         * We show specific page
         */
        query = {
            site_id: inData.site_id,
            slug: inData.slug,
            deleted: false
        };
    }

    Post.findOne(query).exec(function(err, post) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (post) {

            // in case if post is private
            if (post.private_page) {
                return res.send({
                    success: false
                });
            }

            return res.send({
                success: true,
                post: true,
                data: post
            });

        } else {

            // we check the products

            let slug = inData.slug;
            /*if (slug) {
                let spliter = inData.slug.split("/");
                
                if (spliter.length > 1) {
                    slug = spliter[spliter.length - 1];
                }
            }*/

            let query = {
                site_id: inData.site_id,
                slug: slug
            };

            Product.findOne(query)
                .populate('attachments.file')
                .populate('images.file')
                .exec(function(err, product) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }

                    if (product) {

                        // in case if post is private
                        if (product.private_page) {
                            return res.send({
                                success: false
                            });
                        }

                        return res.send({
                            success: true,
                            post: false,
                            data: product
                        });

                    } else {

                        return res.send({
                            success: false
                        });

                    }

                });

        }

    });

}

/**
 * Get site template
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getSiteTemplate(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;
    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {
        Site.findOne({
                _id: new ObjectId(id)
            })
            .populate('theme_id')
            .populate('menus.menu.pages.page_id')
            .populate('menus.menu.pages.children.page_id')
            .populate('menus.menu.pages.children.children.page_id')
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site && site.theme_id) {

                    new Promise(function(resolve, reject) {

                        if (inData.themeId) {

                            if ((inData.themeId && checkID.test(inData.themeId))) {

                                Theme.findOne({
                                        _id: new ObjectId(inData.themeId)
                                    })
                                    .exec(function(err, theme) {

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
                                            site.theme_id = theme;

                                            resolve();
                                        } else {
                                            return res.send({
                                                success: false,
                                                message: 'Theme not found'
                                            });
                                        }

                                    });

                            } else {
                                resolve();
                            }

                        } else {
                            resolve();
                        }


                    }).then(function(status) {


                        /**
                         * We check for page language
                         */
                        let url = inData.slug.split('/');
                        let isLang = false;
                        let checkLang = (url[1]) ? url[1] : false;
                        let usedLang = (site.main_lang_prefix) ? site.main_lang_prefix : 'main';

                        /**
                         * Check for the page language - for the menu
                         */
                        if (checkLang) {
                            if (site.multilanguage && site.languages && site.languages.length > 0) {

                                for (let i = 0; i < site.languages.length; i++) {

                                    if (checkLang == site.languages[i].prefix) {
                                        isLang = true;
                                        usedLang = site.languages[i].prefix;
                                    }

                                }

                            }
                        }

                        let configuration = site.theme_id.configuration[site.theme_id.configuration.length - 1];

                        if (inData.themeVersion && (!isNaN(inData.themeVersion))) {
                            configuration = site.theme_id.configuration[parseInt(inData.themeVersion)];
                        }


                        let menuData = {};

                        /**
                         * We add all menus
                         */

                        /**
                         * We select the right menu
                         */
                        if (site.menus && site.menus.length > 0) {

                            for (let menus of site.menus) {

                                menuData[menus.slug] = [];

                                if (menus.menu && menus.menu.length) {

                                    for (let menu of menus.menu) {

                                        if (menu.lang_prefix == usedLang) {

                                            for (let i = 0; i < menu.pages.length; i++) {

                                                // 2nd level
                                                let children = [];

                                                if (menu.pages[i].children.length > 0) {
                                                    for (let j = 0; j < menu.pages[i].children.length; j++) {

                                                        // 3rd level
                                                        let children2 = [];

                                                        if (menu.pages[i].children[j].children.length > 0) {

                                                            for (let k = 0; k < menu.pages[i].children[j].children.length; k++) {

                                                                if (menu.pages[i].children[j].children[k].page_id) {

                                                                    children2.push({
                                                                        title: menu.pages[i].children[j].children[k].page_id.title,
                                                                        href: menu.pages[i].children[j].children[k].page_id.slug
                                                                    });

                                                                }

                                                            }


                                                        }

                                                        if (menu.pages[i].children[j].page_id) {

                                                            children.push({
                                                                title: menu.pages[i].children[j].page_id.title,
                                                                href: menu.pages[i].children[j].page_id.slug,
                                                                children: children2
                                                            });

                                                        } else if (menu.pages[i].children[j].category) {
                                                            children.push({
                                                                title: menu.pages[i].children[j].category,
                                                                href: '',
                                                                children: children2
                                                            });
                                                        }

                                                    }
                                                }

                                                if (menu.pages[i].page_id) {

                                                    menuData[menus.slug].push({
                                                        title: menu.pages[i].page_id.title,
                                                        href: menu.pages[i].page_id.slug,
                                                        children: children
                                                    });

                                                } else if (menu.pages[i].category) {
                                                    menuData[menus.slug].push({
                                                        title: menu.pages[i].category,
                                                        href: '',
                                                        children: children
                                                    });
                                                }

                                            }

                                        }



                                    }

                                }

                            }

                        }


                        if (site.multilanguage) {
                            /**
                             * @todo potrebno pridobiti translacijske datoteke v primeru, da je multilanguage
                             */



                        }

                        let templateHeader = handlebars.compile(configuration.layout.header);

                        let headerData = menuData;

                        let headerHtml = templateHeader(headerData);

                        let templateFooter = handlebars.compile(configuration.layout.footer);

                        let footerData = menuData;

                        let footerHtml = templateFooter(footerData);


                        let cookie_info = {};

                        if (site.cookies_enabled) {
                            for (let i = 0; i < site.cookies_info.length; i++) {
                                if (site.cookies_info[i].lang == usedLang) {
                                    cookie_info = site.cookies_info[i];
                                }
                            }
                        }

                        let chat_text = {};

                        if (site.chat_enabled &&
                            site.chat_settings &&
                            site.chat_settings.text &&
                            site.chat_settings.text.length > 0) {

                            for (let i = 0; i < site.chat_settings.text.length; i++) {
                                if (site.chat_settings.text[i].lang == usedLang) {
                                    chat_text = site.chat_settings.text[i];
                                }
                            }

                        }


                        return res.send({
                            success: true,
                            data: {
                                themeId: site.theme_id._id.toString(),
                                header: headerHtml,
                                footer: footerHtml,
                                cookies_enabled: site.cookies_enabled,
                                cookies_info: cookie_info,
                                google_maps_api: site.google_maps_api,
                                google_analytics_api: site.google_analytics_api,
                                chat_enabled: site.chat_enabled,
                                chat_settings: site.chat_settings,
                                chat_text: chat_text,
                                public: site.public
                            }
                        });


                    });

                } else {
                    return res.send({
                        success: false
                    });
                }

            });
    } else {
        res.sendStatus(401);
    }

}

/**
 * Get all pages from site list
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getAllPagesList(req, res, next) {

    let id = req.params.id;
    let lang = req.params.lang;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        let query = {
            site_id: new ObjectId(id),
            type: 'page'
        }

        if (lang) {
            query['lang_prefix'] = lang;
        }

        Post.find(query)
            .select('title slug homepage')
            .populate('user_id')
            .exec(function(err, posts) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (posts.length > 0) {
                    return res.send({
                        success: true,
                        data: posts
                    });
                } else {
                    return res.send({
                        success: true,
                        data: []
                    });
                }

            });
    } else {
        res.sendStatus(401);
    }

}

/**
 * Add menu
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function addMenu(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (inData.id && checkID.test(inData.id)) {

        let id = inData.id;

        Site.findOne({
                _id: new ObjectId(id)
            })
            .populate('theme_id')
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    if (site.menus && site.menus.length > 0) {

                        for (let i = 0; i < site.menus.length; i++) {

                            if (site.menus[i].slug == inData.slug) {

                                return res.send({
                                    success: false,
                                    message: 'Menu with such name exists'
                                });

                            }

                        }

                    } else {
                        site.menus = [];
                    }

                    site.menus.push({
                        name: inData.name,
                        slug: inData.slug
                    });

                    site.save(function(err) {

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
                            data: site.menus[site.menus.length - 1]._id
                        });

                    });

                } else {
                    return res.send({
                        success: false
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Get all site menu
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getAllMenu(req, res, next) {

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        Site.findOne({
                _id: new ObjectId(id)
            })
            .select('menus')
            .populate('menus.menu.pages.page_id', 'title slug')
            .populate('menus.menu.pages.children.page_id', 'title slug')
            .populate('menus.menu.pages.children.children.page_id', 'title slug')
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    return res.send({
                        success: true,
                        data: site.menus
                    });

                } else {
                    return res.send({
                        success: false
                    });
                }
            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Add pages to the menu
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function addMenuPages(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    //let tmp = Buffer.from(JSON.stringify(req.body)).length

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (inData.id && checkID.test(inData.id)) {

        let id = inData.id;

        Site.findOne({
                _id: new ObjectId(id)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    if (inData.menus && inData.menus.length > 0) {

                        /**
                         * We check if for existing menus
                         */
                        for (let i = 0; i < site.menus.length; i++) {

                            for (let j = 0; j < inData.menus.length; j++) {

                                if (site.menus[i].slug == inData.menus[j].slug) {

                                    site.menus[i].menu = [];

                                    /**
                                     * 1. We find the right menu
                                     * 2. We iterate thru the arrays of menus (each for each translation)
                                     */
                                    for (let k = 0; k < inData.menus[j].menu.length; k++) {

                                        /**
                                         * lang_prefix
                                         * pages
                                         */

                                        if (inData.menus[j].menu[k].lang_prefix && inData.menus[j].menu[k].pages) {

                                            let pages = [];

                                            for (let l = 0; l < inData.menus[j].menu[k].pages.length; l++) {

                                                let children = [];
                                                if (inData.menus[j].menu[k].pages[l].children) {

                                                    for (let m = 0; m < inData.menus[j].menu[k].pages[l].children.length; m++) {

                                                        let children2 = [];

                                                        if (inData.menus[j].menu[k].pages[l].children[m].children) {

                                                            for (let n = 0; n < inData.menus[j].menu[k].pages[l].children[m].children.length; n++) {

                                                                let saveObject = {
                                                                    order: (inData.menus[j].menu[k].pages[l].children[m].children[n].order) ? inData.menus[j].menu[k].pages[l].children[m].children[n].order : (n + 1)
                                                                }

                                                                if (inData.menus[j].menu[k].pages[l].children[m].children[n].category) {
                                                                    saveObject['category'] = inData.menus[j].menu[k].pages[l].children[m].children[n].category;
                                                                } else {
                                                                    saveObject['page_id'] = inData.menus[j].menu[k].pages[l].children[m].children[n]._id;
                                                                }

                                                                children2.push(saveObject);

                                                            }

                                                        }

                                                        let saveObject = {
                                                            order: (inData.menus[j].menu[k].pages[l].children[m].order) ? inData.menus[j].menu[k].pages[l].children[m].order : (m + 1),
                                                            children: children2
                                                        }

                                                        if (inData.menus[j].menu[k].pages[l].children[m].category) {
                                                            saveObject['category'] = inData.menus[j].menu[k].pages[l].children[m].category;
                                                        } else {
                                                            saveObject['page_id'] = inData.menus[j].menu[k].pages[l].children[m]._id;
                                                        }

                                                        children.push(saveObject);

                                                    }

                                                }

                                                let saveObject = {
                                                    order: (inData.menus[j].menu[k].pages[l].order) ? inData.menus[j].menu[k].pages[l].order : (l + 1),
                                                    children: children
                                                }

                                                if (inData.menus[j].menu[k].pages[l].category) {
                                                    saveObject['category'] = inData.menus[j].menu[k].pages[l].category;
                                                } else {
                                                    saveObject['page_id'] = inData.menus[j].menu[k].pages[l]._id;
                                                }

                                                pages.push(saveObject);

                                            }

                                            site.menus[i].menu.push({
                                                lang_prefix: inData.menus[j].menu[k].lang_prefix,
                                                pages: pages //(inData.menus[j].menu[k].pages) ? inData.menus[j].menu[k].pages : []
                                            });

                                        }

                                    }

                                }

                            }

                        }

                        site.save(function(err) {

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
                                success: true
                            });

                        });

                    } else {
                        return res.send({
                            success: true
                        });
                    }

                } else {
                    return res.send({
                        success: false
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function showLinksChild(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((inData.site_id && checkID.test(inData.site_id)) && inData.id && checkID.test(inData.id)) {

        Post.findOne({
                _id: new ObjectId(inData.id),
                site_id: new ObjectId(inData.site_id)
            })
            .exec(function(err, post) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (post) {
                    post.show_links_menu_children = !post.show_links_menu_children;

                    post.save(function(err) {

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
                            success: true
                        });

                    });

                } else {
                    return res.sendStatus(401);
                }

            });

    } else {
        return res.sendStatus(401);
    }
}

/**
 * Delete specific menu
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function deleteMenu(req, res, next) {

    var menuid = req.params.menuid;

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (menuid && checkID.test(menuid))) {

        Site.findOne({
                _id: new ObjectId(id)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    if (site.menus) {
                        for (let i = 0; i < site.menus.length; i++) {

                            if (menuid == site.menus[i]._id.toString()) {
                                site.menus.splice(i, 1);
                            }

                        }

                        site.save(function(err) {

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
                                success: true
                            });

                        });
                    } else {
                        return res.send({
                            success: false
                        });
                    }
                } else {
                    return res.send({
                        success: false
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Add new theme
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function addTheme(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((inData.id && checkID.test(inData.id))) {

        let id = inData.id;

        Site.findOne({
                _id: new ObjectId(id)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    let newTheme = new Theme();
                    newTheme.name = inData.name;
                    newTheme.description = inData.description;
                    newTheme.configuration.push({
                        layout: {
                            header: inData.header,
                            footer: inData.footer
                        },
                        css: inData.css,
                        jsfile: inData.jsfile,
                        configured_user_id: req.user._id
                    });
                    newTheme.author_id = new ObjectId(req.user._id);
                    newTheme.site_id = new ObjectId(id);
                    newTheme.version = 1;

                    newTheme.save(function(err) {
                        if (err) {
                            logger.log({
                                level: 'error',
                                message: 'Mongo - error',
                                context: __filename,
                                details: `stderr: ${err}`,
                            });

                            throw err;
                        }

                        /**
                         * @todo We generate or update CSS and JS file
                         */



                        return res.send({
                            success: true
                        });
                    });

                } else {
                    return res.send({
                        success: false
                    });
                }

            });


    } else {
        res.sendStatus(401);
    }
}

/**
 * Update existing theme
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function updateTheme(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var id = req.params.id;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        let inData = req.body;

        let siteId = inData.site_id;

        Theme.findOne({
                _id: new ObjectId(id),
                site_id: new ObjectId(siteId)
            })
            .exec(function(err, theme) {

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

                    theme.name = inData.name;
                    theme.description = inData.description;
                    theme.configuration.push({
                        layout: {
                            header: inData.header,
                            footer: inData.footer
                        },
                        css: inData.css,
                        jsfile: inData.jsfile,
                        configured_user_id: req.user._id
                    });

                    // we save only 10 of them
                    if (theme.configuration.length > 10) {
                        theme.configuration.shift();
                    }

                    theme.version += 1;

                    theme.save(function(err) {
                        if (err) {
                            logger.log({
                                level: 'error',
                                message: 'Mongo - error',
                                context: __filename,
                                details: `stderr: ${err}`,
                            });

                            throw err;
                        }

                        //#region We generate or update CSS and JS file

                        generateCSSandJS(theme._id, inData.css, inData.jsfile).then((data) => {

                            return res.send({
                                success: true
                            });

                        }).catch((reason) => {

                            return res.send({
                                success: false,
                                message: reason
                            });

                        });

                        //#endregion

                    });

                } else {

                    return res.send({
                        success: false
                    });

                }


            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Get installed themes
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getInstalled(req, res, next) {

    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        Theme.find({
                site_id: new ObjectId(id)
            })
            .exec(function(err, themes) {

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
                    data: themes
                });

            });

    } else {
        res.sendStatus(401);
    }

}

function getFromMarket(req, res, next) {

}

function getSpecificTheme(req, res, next) {

    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        Theme.findOne({
                _id: new ObjectId(id)
            })
            .exec(function(err, theme) {

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
                        data: theme
                    });

                } else {

                    return res.send({
                        success: false
                    });

                }


            });

    } else {
        res.sendStatus(401);
    }

}

function selectTheme(req, res, next) {

    let siteid = req.params.siteid;
    let themeid = req.params.themeid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) &&
        (themeid && checkID.test(themeid))) {


        Theme.findOne({
                _id: new ObjectId(themeid)
            })
            .exec(function(err, theme) {

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

                    Site.findOne({
                            _id: new ObjectId(siteid)
                        })
                        .exec(function(err, site) {

                            if (err) {
                                logger.log({
                                    level: 'error',
                                    message: 'Mongo - error',
                                    context: __filename,
                                    details: `stderr: ${err}`,
                                });

                                throw err;
                            }

                            if (site) {

                                let configuration = theme.configuration[theme.configuration.length - 1];

                                generateCSSandJS(theme._id, configuration.css, configuration.jsfile).then((data) => {

                                    theme.selected = true;
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

                                        let oldThemeId = site.theme_id;
                                        site.theme_id = theme._id;
                                        site.save((err) => {

                                            if (err) {
                                                logger.log({
                                                    level: 'error',
                                                    message: 'Mongo - error',
                                                    context: __filename,
                                                    details: `stderr: ${err}`,
                                                });

                                                throw err;
                                            }

                                            if (site.theme_id.toString() == oldThemeId.toString()) {
                                                return res.send({
                                                    success: true
                                                })
                                            } else {

                                                Theme.findOne({
                                                        _id: oldThemeId
                                                    })
                                                    .exec(function(err, theme) {

                                                        if (err) {
                                                            logger.log({
                                                                level: 'error',
                                                                message: 'Mongo - error',
                                                                context: __filename,
                                                                details: `stderr: ${err}`,
                                                            });

                                                            throw err;
                                                        }

                                                        theme.selected = false;

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
                                                                success: true
                                                            })

                                                        })

                                                    });

                                            }

                                        });

                                    })

                                }).catch((reason) => {

                                    return res.send({
                                        success: false,
                                        message: reason
                                    });

                                });

                            } else {

                                return res.send({
                                    success: false,
                                    message: 'Site not found'
                                });

                            }

                        });

                } else {

                    return res.send({
                        success: false,
                        message: 'Theme not found'
                    });

                }

            });


    } else {
        res.sendStatus(401);
    }

}

function deleteTheme(req, res, next) {

    let siteid = req.params.siteid;
    let themeid = req.params.themeid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) &&
        (themeid && checkID.test(themeid))) {


        Theme.findOne({
                '_id': themeid,
                'site_id': siteid,
                'public': false
            })
            .exec(function(err, theme) {

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
                    // we delete theme files
                    deleteCSSandJS(theme._id);

                    Theme.deleteOne({
                            '_id': themeid,
                            'site_id': siteid,
                            'public': false
                        })
                        .exec(function(err, theme) {

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
                                success: true
                            });

                        });

                } else {
                    return res.send({
                        success: false,
                        message: 'Theme not found'
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }
}


function resolveHost(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    Site.findOne({
            domain: inData.host,
            active: true
        })
        .select('_id title')
        .exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                let data = JSON.parse(JSON.stringify(site));

                data['multisite'] = settings.multisite;

                return res.send({
                    success: true,
                    data: data
                });
            } else {
                return res.send({
                    success: false
                });
            }
        });



}

/**
 * Geta all users from site 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getUsers(req, res, next) {

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        User.find({
                'site_id': id
            })
            .exec(function(err, users) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (users) {

                    return res.send({
                        success: true,
                        data: users,
                        count: users.length
                    });

                } else {
                    return res.send({
                        success: false
                    });
                }
            });

    } else {
        res.sendStatus(401);
    }

}


/**
 * Geta all users from site 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getShareableUsers(req, res, next) {

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        User.find({
            'site_id': id,
            //'role': 4
        }).exec(function(err, users) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (users.length > 0) {
                return res.send({
                    success: true,
                    data: users,
                    count: (users) ? users.length : 0
                });
            } else {
                return res.send({
                    success: false
                });
            }

        });

        /*
        Site.findOne({
                '_id': id
            })
            .populate('users.user_id')
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
                }

                if (site) {

                    let users = [];

                    for(let i = 0; i < site.users.length > 0; i++) {
                        if(site.users[i].role == 4) {
                            users.push(site.users[i]);
                        }
                    }


                    return res.send({
                        success: true,
                        data: users,
                        count: (users) ? users.length : 0
                    });

                } else {
                    return res.send({
                        success: false
                    });
                }
            });*/


    } else {
        res.sendStatus(401);
    }

}

/**
 * Geta specific user from site 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getUser(req, res, next) {

    let siteid = req.params.siteid;
    let userid = req.params.userid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (userid && checkID.test(userid))) {

        User.findOne({
                '_id': userid,
                'site_id': siteid
            })
            .exec(function(err, user) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (user) {
                    return res.send({
                        success: true,
                        data: user
                    });
                } else {
                    return res.send({
                        success: false,
                        message: 'User not found'
                    });
                }
            });

    } else {
        res.sendStatus(401);
    }

}



function getUserProfile(req, res, next) {

    User.findOne({
            _id: new ObjectId(req.user._id)
        })
        .exec(function(err, user) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (user) {
                return res.send({
                    success: true,
                    data: user
                });
            } else {
                return res.send({
                    success: false,
                    message: 'User not found'
                });
            }

        });

}

function updateUserProfile(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    User.findOne({
            '_id': new ObjectId(req.user._id)
        })
        .exec(function(err, user) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (user) {

                user.email = inData.email;
                user.first_name = inData.first_name;
                user.last_name = inData.last_name;
                user.full_name = inData.full_name;
                user.initials = inData.first_name[0] + inData.last_name[0];
                user.color = inData.color;

                if (inData.password && inData.password.length > 5) {
                    user.setPassword(inData.password);
                }

                user.save((err) => {

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
                        success: true
                    });

                });

            } else {
                return res.send({
                    success: false,
                    message: 'User not found'
                });
            }


        });

}

function addUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    /**
     * If we are adding users we need to have password
     */
    if (inData.registrationType == 'add') {
        if (!inData.password) {
            return res.status(422).json({
                success: false
            });
        }
    }

    if (inData.password && inData.password.length < 6) {
        return res.status(422).json({
            success: false
        });
    }

    User.findOne({
            'email': inData.email,
            'site_id': inData.site_id
        })
        .exec(function(err, user) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (user) {
                return res.send({
                    success: false,
                    message: 'Such user already exists'
                });
            } else {
                let newUser = new User();
                newUser.email = inData.email;
                newUser.first_name = inData.first_name;
                newUser.last_name = inData.last_name;
                newUser.full_name = inData.full_name;
                newUser.site_id = inData.site_id;

                // only superadmin can add superadmin
                if(inData.role == 0 || inData.role == '0') {                    
                    if (roles.SUPER_ADMIN != req.user.role) {
                        return res.send({
                            success: false,
                            message: 'You don\'t have permission to add superadmin'
                        });
                    }                   
                }
                newUser.role = inData.role;

                newUser.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                newUser.initials = newUser.first_name[0] + newUser.last_name[0];

                if (inData.registrationType == 'add') {
                    newUser['activated'] = true;
                }

                if (inData.company) {
                    newUser.company = inData.company;
                }

                if (inData.registrationType == 'invite') {
                    newUser['activated'] = false;
                    newUser['activation_link'] = crypto.randomBytes(20).toString('hex');

                    if (inData.message) {
                        newUser['invitation_message'] = inData.message;
                    }
                }

                /**
                 * If invitation we don't need password
                 */
                if (inData.password) {
                    newUser.setPassword(inData.password);
                }

                newUser.save((err) => {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }

                    if (inData.registrationType == 'invite' && !inData.no_email) {

                        try {

                            let link = req.headers.origin + '/invitation/' + newUser.activation_link;

                            email.sendEmail(
                                newUser.email,
                                'Invitation',
                                'Follow this link (' + link + ') to accept invitation and create your own account.',
                                'invite.html', {
                                    link: link,
                                    message: (inData.message) ? inData.message : ''
                                }
                            );

                            return res.send({
                                success: true,
                                data: newUser
                            });

                        } catch (e) {

                            User.remove({
                                '_id': newUser._id
                            }, function(err) {

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
                                    success: false,
                                    message: 'Error at sending e-mail'
                                });

                            });

                        }

                    } else {
                        return res.send({
                            success: true,
                            data: newUser
                        });
                    }

                });
            }

        });


}

// ? vprašanje - ali lahko admin spreminja podatke o uporabniku?
function updateUser(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    if (inData.password && inData.password.length < 6) {
        return res.status(422).json({
            success: false
        });
    }

    let siteid = inData.site_id
    let userid = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((userid && checkID.test(userid)) && (siteid && checkID.test(siteid))) {

        User.findOne({
                '_id': userid,
                'site_id': inData.site_id
            })
            .exec(function(err, user) {
                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (user) {
                    user.email = inData.email;
                    user.first_name = inData.first_name;
                    user.last_name = inData.last_name;
                    user.full_name = inData.full_name;

                    // only superadmin can add superadmin
                    if(inData.role == 0 || inData.role == '0') {                    
                        if (roles.SUPER_ADMIN != req.user.role) {
                            return res.send({
                                success: false,
                                message: 'You don\'t have permission to add superadmin'
                            });
                        }                   
                    }
                    user.role = inData.role;

                    if (!user.color) {
                        user.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                    }
                    if (user.first_name && user.last_name) {
                        user.initials = user.first_name[0] + user.last_name[0];
                    }

                    // if password is not empty we generate hash
                    if (inData.password) {
                        user.setPassword(inData.password);
                    }

                    if (inData.company) {
                        user.company = inData.company;
                    }

                    user.save((err) => {

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
                            data: user
                        })

                    });

                } else {
                    return res.send({
                        success: false
                    })
                }
            });

    } else {
        res.sendStatus(401);
    }

}


/**
 * Delete user from site
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function deleteUser(req, res, next) {

    let siteid = req.params.siteid;
    let userid = req.params.userid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (userid && checkID.test(userid))) {

        User.findOne({
                '_id': userid,
                'site_id': siteid
            })
            .exec(function(err, user) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (user) {

                    User.remove({
                        '_id': userid,
                        'site_id': siteid
                    }, function(err) {

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
                            success: true
                        });
                    });

                } else {
                    return res.send({
                        success: false,
                        message: 'Such user does not exists'
                    })
                }
            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Get categories
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getCategories(req, res, next) {

    let site_id = req.params.site_id;
    let lang = req.params.lang;

    let langRestrict = false;

    if (lang != 'undefined') {
        langRestrict = !(lang == 'all');
    }

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (site_id && checkID.test(site_id)) {

        let query = {
            site_id: site_id
        };

        if (langRestrict) {
            query['lang_prefix'] = lang;
        }

        Category.countDocuments(query).exec(function(err, catNumber) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            Category.find(query)
                .populate('user_id')
                .sort({
                    date_created: 1
                })
                .exec(function(err, categories) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }

                    res.send({
                        success: true,
                        data: categories,
                        count: catNumber
                    });

                });

        });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Add category
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function addCategory(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    var category = new Category();
    category.name = inData.name;
    category.slug = inData.slug;
    if (inData.lang) {
        category.lang_prefix = inData.lang;
    }
    category.site_id = inData.site_id;
    category.user_id = new ObjectId(req.user._id);

    category.save(function(err) {

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
            success: true
        });

    });

}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getCategory(req, res, next) {

    let siteid = req.params.siteid;
    let categoryid = req.params.categoryid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (categoryid && checkID.test(categoryid))) {

        Category.findOne({
                '_id': categoryid,
                'site_id': siteid
            })
            .exec(function(err, category) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (category) {

                    return res.send({
                        success: true,
                        data: category
                    });

                } else {

                    return res.send({
                        success: false,
                        message: 'Category not found'
                    });

                }
            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function updateCategory(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    let categoryid = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (categoryid && checkID.test(categoryid)) {

        Category.findOne({
                '_id': categoryid,
                'site_id': inData.site_id
            })
            .exec(function(err, category) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (category) {

                    category.name = inData.name;
                    category.slug = inData.slug;
                    if (inData.lang) {
                        category.lang_prefix = inData.lang;
                    }

                    category.save((err) => {

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
                            success: true
                        });

                    });

                } else {
                    return res.send({
                        success: false,
                        message: 'Such category does not exists'
                    })
                }

            });
    } else {
        res.sendStatus(401);
    }

}

/**
 * Delete category
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function deleteCategory(req, res, next) {

    var categoryid = req.params.catid;

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (categoryid && checkID.test(categoryid))) {

        Category.deleteOne({
                '_id': categoryid,
                'site_id': id
            })
            .exec(function(err, category) {

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
                    success: true
                });

            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Upload image helper
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function uploadImage(req, res) {

    if(!req.files) {
        return res.status(422).json({
            success: false
        });
    }

    let file_extension = '.jpg';

    if (req.files[0].mimetype == 'image/png') {
        file_extension = '.png';
    }

    if (req.files[0].mimetype == 'image/x-icon') {
        file_extension = '.ico';
    }

    Site.findOne({
        _id: new ObjectId(req.body.site_id)
    }).select('image_size').exec(function(err, site) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (site) {

            let originalName = req.files[0].originalname;
            let newFilename = req.files[0].filename + file_extension;


            if (req.body.favicon == 'false') {
                // if not favicon
                for (let i = 0; i < site.image_size.length; i++) {
                    // we add image size
                    manipulatorAddImageSize(
                        site.image_size[i].name,
                        site.image_size[i].width,
                        site.image_size[i].height,
                        site.image_size[i].algorithm
                    );
                }
            } else {

                // file .ico cannot be resized
                if (file_extension != '.ico') {

                    // if favicon - we add size
                    manipulatorAddImageSize(
                        'favicon',
                        25,
                        25,
                        'center'
                    );

                }

            }




            new Promise((res, rej) => {

                let imagePath = path.join(__dirname, '../', 'tmp/' + req.files[0].filename);
                let destination = path.join(
                    __dirname,
                    '../../',
                    (settings.development ? ('web/src/assets/') : ('web/dist/browser/assets/')));
                let destinationFileName = newFilename;


                fs.copyFileSync(imagePath, (destination + destinationFileName));


                let imageManipulation = manipulatorDifferentSizeGenerator(
                    imagePath,
                    destination,
                    destinationFileName
                );

                imageManipulation.then((val) => {

                    let newFile = new File();
                    newFile.filename = newFilename;
                    newFile.filepath = destination + destinationFileName;
                    newFile.image = true;

                    newFile.file_dimensions = [];
                    for (let i = 0; i < val.length; i++) {
                        newFile.file_dimensions.push({
                            name: val[i].name,
                            filename: val[i].filename
                        })
                    }

                    newFile.original_name = originalName;
                    newFile.filesize = req.files[0].size;
                    newFile.filetype = req.files[0].mimetype;
                    newFile.url = '/assets/' + newFilename;
                    newFile.user_id = new ObjectId(req.user._id);
                    newFile.visible_public = true;
                    newFile.site_id = req.body.site_id;
                    newFile.save((err) => {

                        if (err) {
                            logger.log({
                                level: 'error',
                                message: 'Mongo - error',
                                context: __filename,
                                details: `stderr: ${err}`,
                            });

                            throw err;
                        }

                        res(newFile);

                    });

                }).catch(err => {
                    rej(true, err);
                })


            }).then(function(file) {


                try {

                    fs.unlink(path.join(__dirname, '../', 'tmp/' + req.files[0].filename), function(err) {

                        if (err) {
                            console.log(err);
                        }


                        if (!file) {
                            return res.send({
                                success: false,
                                data: file,
                                id: file._id
                            })
                        } else {
                            file['url'] = '/assets/' + newFilename;

                            return res.send({
                                success: true,
                                data: file
                            })
                        }

                    });

                } catch (e) {
                    return res.send({
                        success: false,
                        message: 'Problems with converting image'
                    })
                }

            }).catch(error => {

                console.log(error);

                try {

                    fs.unlink(path.join(__dirname, '../', 'tmp/' + req.files[0].filename), function(err) {

                        if (err) {
                            console.log(err);
                        }

                        return res.send({
                            success: false,
                            message: 'Problems with converting image'
                        })


                    });

                } catch (e) {
                    return res.send({
                        success: false,
                        message: 'Problems with converting image'
                    })
                }

            });


        } else {
            return res.send({
                success: false,
                message: 'Site not found'
            })
        }

    });

}

/**
 * Upload file - asset
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function uploadAsset(req, res, next) {

    if(!req.files) {
        return res.status(422).json({
            success: false
        });
    }

    Site.findOne({
        _id: new ObjectId(req.body.site_id)
    }).select('image_size').exec(function(err, site) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (site) {

            let originalName = req.files[0].originalname;

            let fileExtension = null;
            let tmp = originalName.split('.');

            if (tmp && tmp.length > 0) {
                fileExtension = '.' + tmp[tmp.length - 1];
            }

            let newFilename = req.files[0].filename + fileExtension;

            let destination = path.join(__dirname, '../../',
                (settings.development ?
                    ('web/src/assets/') :
                    ('web/dist/browser/assets/')) +
                newFilename);


            fs.rename(path.join(__dirname, '../', 'tmp/' + req.files[0].filename), destination, function(err) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                let newFile = new File();
                newFile.filename = newFilename;
                newFile.filepath = destination;
                newFile.original_name = originalName;
                newFile.filesize = req.files[0].size;
                newFile.filetype = req.files[0].mimetype;
                newFile.url = '/assets/' + newFilename;
                newFile.user_id = new ObjectId(req.user._id);
                newFile.visible_public = true;
                newFile.site_id = req.body.site_id;
                newFile.save((err) => {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }

                    // we generate different images
                    let generateImages = new Promise(function(resolve, reject) {

                        if ((/\.(gif|jpe?g|tiff|png|webp|bmp)$/i).test(newFile.filename)) {

                            for (let i = 0; i < site.image_size.length; i++) {
                                // we add image size
                                manipulatorAddImageSize(
                                    site.image_size[i].name,
                                    site.image_size[i].width,
                                    site.image_size[i].height,
                                    site.image_size[i].algorithm
                                );
                            }

                            let imagePath = newFile.filepath;
                            let destination = path.dirname(newFile.filepath);
                            let destinationFileName = newFile.filename;

                            let imageManipulation = manipulatorDifferentSizeGenerator(
                                imagePath,
                                destination,
                                destinationFileName
                            );

                            imageManipulation.then((val) => {

                                let file_dimensions = [];
                                for (let i = 0; i < val.length; i++) {
                                    file_dimensions.push({
                                        name: val[i].name,
                                        filename: val[i].filename
                                    })
                                }

                                File.updateOne({
                                    _id: newFile._id
                                }, {
                                    $set: {
                                        file_dimensions: file_dimensions,
                                        image: true
                                    }
                                }, {
                                    multi: true
                                }).exec(function(err, data) {

                                    if (err) {
                                        logger.log({
                                            level: 'error',
                                            message: 'Mongo - error',
                                            context: __filename,
                                            details: `stderr: ${err}`,
                                        });

                                        throw err;
                                    }

                                    resolve(true);

                                })


                            }).catch(err => {
                                console.log(err);
                                console.log(file);

                                resolve(true);

                            })


                        } else {
                            resolve(true);
                        }

                    });

                    generateImages.then((data) => {

                        return res.send({
                            success: true,
                            data: newFile
                        })

                    });

                });


            });

        } else {
            return res.send({
                success: false,
                message: 'Site not found'
            })
        }


    });

}


/**
 * Upload shareables
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function uploadShareable(req, res, next) {

    let filename = req.files[0].filename;

    let destination = path.join(__dirname, '../shareables/' + filename);

    let newFile = new File();
    newFile.filename = filename;
    newFile.filepath = destination;
    newFile.original_name = req.files[0].originalname;
    newFile.filesize = req.files[0].size;
    newFile.filetype = req.files[0].mimetype;
    newFile.user_id = new ObjectId(req.user._id);
    if (req.body.transfer == 'true') {
        newFile.transfer = true;
    }
    newFile.visible_public = false;
    newFile.site_id = req.body.site_id;
    newFile.save((err) => {

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
            data: newFile
        })

    });

}

/**
 * Get files - only for admin page use
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

function getFiles(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let site_id = req.params.siteid;
    let inData = req.body;

    //#region we setup params
    let offset = 0;
    let index = 0;
    let size = 0;
    let sort = false;
    let direction = false;

    if (!isNaN(inData.offset)) {
        offset = parseInt(inData.offset);
    }

    if (!isNaN(inData.index)) {
        index = parseInt(inData.index);
    }

    if (!isNaN(inData.size)) {
        size = parseInt(inData.size);
    }

    if (inData.sort != 'undefined') {
        sort = inData.sort;
    }

    if (inData.direction != 'undefined') {
        direction = inData.direction;
    }
    //#endregion

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (site_id && checkID.test(site_id)) {

        Site.findOne({
            _id: new ObjectId(site_id)
        }).exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                let query = {
                    visible_public: (inData.public && inData.public == 'true') ? true : false,
                    site_id: site_id
                };

                if (roles.EXCHANGE == req.user.role) {
                    query['user_id'] = req.user._id;
                }

                if (inData.transfer && inData.transfer == 'true') {
                    query['transfer'] = true;
                }

                if (inData.image == 'true') {
                    query['filetype'] = { $regex: 'image', $options: 'i' }
                }

                File.countDocuments(query).exec(function(err, fileNumber) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }


                    let defaultSort = {
                        date_created: -1
                    }

                    if (sort && direction) {
                        defaultSort = {};
                        defaultSort[sort] = (direction == 'asc') ? 1 : -1;
                    }


                    File.find(query)
                        .skip(index * size)
                        .limit(size)
                        .sort(defaultSort)
                        .populate('user_id')
                        .exec(function(err, files) {

                            if (err) {
                                logger.log({
                                    level: 'error',
                                    message: 'Mongo - error',
                                    context: __filename,
                                    details: `stderr: ${err}`,
                                });

                                throw err;
                            }

                            res.send({
                                success: true,
                                data: files,
                                count: fileNumber
                            });

                        });

                });


            } else {
                return res.send({
                    success: false,
                    message: 'Site not found'
                });
            }

        });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Delete file - deletes also all image sizes
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function deleteFile(req, res, next) {

    let site_id = req.params.siteid;
    let file_id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((site_id && checkID.test(site_id)) && (file_id && checkID.test(file_id))) {


        Site.findOne({
            _id: new ObjectId(site_id)
        }).exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                let query = {
                    _id: new ObjectId(file_id)
                }

                if (roles.EXCHANGE == req.user.role) {
                    query['user_id'] = req.user._id;
                }

                File.findOne(query).exec(function(err, file) {

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

                        File.deleteOne({
                            _id: file_id,
                            site_id: site_id
                        }, (err) => {

                            if (err) {
                                logger.log({
                                    level: 'error',
                                    message: 'Mongo - error',
                                    context: __filename,
                                    details: `stderr: ${err}`,
                                });

                                throw err;
                            }

                            try {

                                // we delete all sizes
                                if (file.file_dimensions.length > 0) {

                                    for (let i = 0; i < file.file_dimensions.length; i++) {

                                        let _filePath = file.filepath.replace(file.filename, '');
                                        fs.unlinkSync(_filePath + file.file_dimensions[i].filename);
                                    }

                                }

                                // we remove the main file
                                fs.unlinkSync(file.filepath);

                                return res.send({
                                    success: true
                                });

                            } catch (err) {

                                return res.send({
                                    success: true
                                });
                            }



                        });

                    } else {

                        return res.send({
                            success: true
                        });

                    }

                });

            } else {
                return res.send({
                    success: false,
                    message: 'Site not found'
                });
            }

        });



    } else {
        res.sendStatus(401);
    }

}

function safeDeleteFile(req, res, next) {

    let site_id = req.params.siteid;
    let file_id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((site_id && checkID.test(site_id)) && (file_id && checkID.test(file_id))) {

        Site.findOne({
            _id: new ObjectId(site_id)
        }).exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                File.findOne({
                    _id: new ObjectId(file_id),
                    site_id: new ObjectId(site_id)
                }).exec(function(err, file) {

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

                        let tmp = file.filename.split('.');
                        let filename = tmp[0];

                        async.series([
                                function(callback) {
                                    // we check for favicon

                                    Site.find({
                                            'favicon': { '$regex': filename, '$options': 'i' }
                                        })
                                        .exec(function(err, site) {

                                            if (err) {
                                                throw err;
                                            }

                                            if (site.length > 0) {
                                                callback(null, {
                                                    location: ['Favicon'],
                                                    shouldDelete: false
                                                });
                                            } else {
                                                callback(null, {
                                                    shouldDelete: true
                                                });
                                            }

                                        });

                                },
                                function(callback) {
                                    // we check for image in file and header

                                    Theme.find({
                                            $or: [{
                                                    'configuration.layout.header': { '$regex': filename, '$options': 'i' }
                                                },
                                                {
                                                    'configuration.layout.footer': { '$regex': filename, '$options': 'i' }
                                                }
                                            ]
                                        })
                                        .exec(function(err, theme) {

                                            if (err) {
                                                throw err;
                                            }

                                            if (theme.length > 0) {
                                                callback(null, {
                                                    location: ['Header or footer'],
                                                    shouldDelete: false
                                                });
                                            } else {
                                                callback(null, {
                                                    shouldDelete: true
                                                });
                                            }

                                        });

                                },
                                function(callback) {
                                    // we check for file in post

                                    Post.find({
                                            $or: [{
                                                    'featured_image': file._id
                                                },
                                                {
                                                    'blocks.value': { '$regex': filename, '$options': 'i' }
                                                },
                                                {
                                                    'blocks.options.gallery.image': file._id
                                                }
                                            ]
                                        })
                                        .exec(function(err, post) {

                                            if (err) {
                                                throw err;
                                            }

                                            if (post.length > 0) {
                                                callback(null, {
                                                    location: ['Posts'],
                                                    shouldDelete: false
                                                });
                                            } else {
                                                callback(null, {
                                                    shouldDelete: true
                                                });
                                            }

                                        });


                                },
                                function(callback) {
                                    // we check for file in products

                                    Product.find({
                                            $or: [{
                                                    'image.file': file._id
                                                },
                                                {
                                                    'attachment.file': file._id
                                                }
                                            ]
                                        })
                                        .exec(function(err, post) {

                                            if (err) {
                                                throw err;
                                            }

                                            if (post.length > 0) {
                                                callback(null, {
                                                    location: ['Products'],
                                                    shouldDelete: false
                                                });
                                            } else {
                                                callback(null, {
                                                    shouldDelete: true
                                                });
                                            }


                                        });

                                }
                            ],
                            function(err, results) {

                                let shouldDelete = true;
                                let locationArray = [];

                                for (let i = 0; i < results.length; i++) {

                                    if (shouldDelete) {
                                        shouldDelete = results[i].shouldDelete;
                                    }

                                    if (!results[i].shouldDelete) {
                                        locationArray = locationArray.concat(results[i].location);
                                    }

                                }

                                if (!shouldDelete) {

                                    return res.send({
                                        success: true,
                                        data: locationArray
                                    });

                                } else {

                                    return res.send({
                                        success: true
                                    });

                                }

                            });


                    } else {
                        return res.send({
                            success: false,
                            message: 'File not found'
                        });
                    }

                });

            } else {
                return res.send({
                    success: false,
                    message: 'Site not found'
                });
            }
        });

    } else {
        res.sendStatus(401);
    }
}

/**
 * Delete file by name
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function deleteFileByName(req, res, next) {
    let site_id = req.params.siteid;
    let filename = req.params.filename;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((site_id && checkID.test(site_id))) {


        Site.findOne({
            _id: new ObjectId(site_id)
        }).exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                let query = {
                    filename: filename
                }

                if (roles.EXCHANGE == req.user.role) {
                    query['user_id'] = req.user._id;
                }

                File.findOne(query).exec(function(err, file) {

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

                        File.deleteOne({
                            _id: file._id,
                            site_id: site_id
                        }, (err) => {

                            if (err) {
                                logger.log({
                                    level: 'error',
                                    message: 'Mongo - error',
                                    context: __filename,
                                    details: `stderr: ${err}`,
                                });

                                throw err;
                            }

                            try {

                                // we delete all sizes
                                if (file.file_dimensions.length > 0) {

                                    for (let i = 0; i < file.file_dimensions.length; i++) {

                                        let _filePath = file.filepath.replace(file.filename, '');
                                        fs.unlinkSync(_filePath + file.file_dimensions[i].filename);
                                    }

                                }

                                // we remove the main file
                                fs.unlinkSync(file.filepath);

                                return res.send({
                                    success: true
                                });

                            } catch (err) {

                                return res.send({
                                    success: true
                                });
                            }



                        });

                    } else {

                        return res.send({
                            success: true
                        });

                    }

                });

            } else {
                return res.send({
                    success: false,
                    message: 'Site not found'
                });
            }

        });



    } else {
        res.sendStatus(401);
    }
}

/**
 * Admin function for web assets to get statistics
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function adminTotalFiles(req, res, next) {
    let site_id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((site_id && checkID.test(site_id))) {

        File.aggregate([{
                    $match: {
                        visible_public: true,
                        site_id: new ObjectId(site_id)
                    }
                },
                { $group: { _id: null, total: { $sum: '$filesize' } } }
            ])
            .sort({
                date_created: -1
            })
            .exec(function(err, files) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (files.length > 0) {
                    return res.send({
                        success: true,
                        data: files[0].total
                    })
                } else {
                    return res.send({
                        success: true,
                        data: 0
                    })
                }

            });

    } else {
        res.sendStatus(401);
    }
}

/**
 * Admin function for web assets to delete all files with broken links
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function adminDeleteBrokenLinks(req, res, next) {
    let site_id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((site_id && checkID.test(site_id))) {

        File.find({
                visible_public: true,
                site_id: new ObjectId(site_id)
            })
            .sort({
                date_created: -1
            })
            .exec(function(err, files) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (files.length > 0) {

                    async.eachSeries(files, function(file, callback) {

                        try {
                            if (!fs.existsSync(file.filepath)) {

                                File.remove({
                                    '_id': file._id,
                                    visible_public: true,
                                    site_id: new ObjectId(site_id)
                                }, function(err) {

                                    if (err) {
                                        logger.log({
                                            level: 'error',
                                            message: 'Mongo - error',
                                            context: __filename,
                                            details: `stderr: ${err}`,
                                        });

                                        throw err;
                                    }

                                    callback();

                                });

                            } else {
                                callback();
                            }
                        } catch (err) {

                            logger.log({
                                level: 'error',
                                message: 'Delete broken link exception',
                                context: __filename,
                                details: `stderr: ${err}`,
                            });

                            callback();
                        }

                    }, function() {

                        return res.send({
                            success: true
                        });

                    });

                } else {
                    return res.send({
                        success: false,
                        message: 'No files'
                    })
                }

            });

    } else {
        res.sendStatus(401);
    }
}

/**
 * Total shareable
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function adminTotalShareable(req, res, next) {
    let site_id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((site_id && checkID.test(site_id))) {

        File.aggregate([{
                    $match: {
                        visible_public: false,
                        transfer: false,
                        site_id: new ObjectId(site_id)
                    }
                },
                { $group: { _id: null, total: { $sum: '$filesize' } } }
            ])
            .sort({
                date_created: -1
            })
            .exec(function(err, files) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (files.length > 0) {
                    return res.send({
                        success: true,
                        data: files[0].total
                    })
                } else {
                    return res.send({
                        success: true,
                        data: 0
                    })
                }

            });

    } else {
        res.sendStatus(401);
    }
}

function adminShowUnusedFiles(req, res, next) {
    let site_id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((site_id && checkID.test(site_id))) {


        Site.findOne({
            _id: new ObjectId(site_id)
        }).exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                File.find({
                    site_id: new ObjectId(site_id)
                }).exec(function(err, files) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }

                    if (files.length > 0) {

                        async.eachSeries(files, function(file, callbackMain) {

                            let tmp = file.filename.split('.');
                            let filename = tmp[0];

                            async.series([
                                    function(callback) {
                                        // we check for favicon

                                        Site.find({
                                                'favicon': { '$regex': filename, '$options': 'i' }
                                            })
                                            .exec(function(err, site) {

                                                if (err) {
                                                    throw err;
                                                }

                                                if (site.length > 0) {
                                                    callback(null, {
                                                        location: ['Favicon'],
                                                        shouldDelete: false
                                                    });
                                                } else {
                                                    callback(null, {
                                                        shouldDelete: true
                                                    });
                                                }

                                            });

                                    },
                                    function(callback) {
                                        // we check for image in file and header

                                        Theme.find({
                                                $or: [{
                                                        'configuration.layout.header': { '$regex': filename, '$options': 'i' }
                                                    },
                                                    {
                                                        'configuration.layout.footer': { '$regex': filename, '$options': 'i' }
                                                    }
                                                ]
                                            })
                                            .exec(function(err, theme) {

                                                if (err) {
                                                    throw err;
                                                }

                                                if (theme.length > 0) {
                                                    callback(null, {
                                                        location: ['Header or footer'],
                                                        shouldDelete: false
                                                    });
                                                } else {
                                                    callback(null, {
                                                        shouldDelete: true
                                                    });
                                                }

                                            });

                                    },
                                    function(callback) {
                                        // we check for file in post

                                        Post.find({
                                                $or: [{
                                                        'featured_image': file._id
                                                    },
                                                    {
                                                        'blocks.value': { '$regex': filename, '$options': 'i' }
                                                    },
                                                    {
                                                        'blocks.options.gallery.image': file._id
                                                    }
                                                ]
                                            })
                                            .exec(function(err, post) {

                                                if (err) {
                                                    throw err;
                                                }

                                                if (post.length > 0) {
                                                    callback(null, {
                                                        location: ['Posts'],
                                                        shouldDelete: false
                                                    });
                                                } else {
                                                    callback(null, {
                                                        shouldDelete: true
                                                    });
                                                }

                                            });


                                    },
                                    function(callback) {
                                        // we check for file in products

                                        Product.find({
                                                $or: [{
                                                        'image.file': file._id
                                                    },
                                                    {
                                                        'attachment.file': file._id
                                                    }
                                                ]
                                            })
                                            .exec(function(err, post) {

                                                if (err) {
                                                    throw err;
                                                }

                                                if (post.length > 0) {
                                                    callback(null, {
                                                        location: ['Products'],
                                                        shouldDelete: false
                                                    });
                                                } else {
                                                    callback(null, {
                                                        shouldDelete: true
                                                    });
                                                }


                                            });

                                    }
                                ],
                                function(err, results) {

                                    let shouldDelete = true;
                                    let locationArray = [];

                                    for (let i = 0; i < results.length; i++) {

                                        if (shouldDelete) {
                                            shouldDelete = results[i].shouldDelete;
                                        }

                                        if (!results[i].shouldDelete) {
                                            locationArray = locationArray.concat(results[i].location);
                                        }

                                    }

                                    if (!shouldDelete) {
                                        file.unused = false;
                                    } else {
                                        file.unused = true;
                                    }

                                    file.save((err) => {

                                        if (err) {
                                            logger.log({
                                                level: 'error',
                                                message: 'Mongo - error',
                                                context: __filename,
                                                details: `stderr: ${err}`,
                                            });

                                            throw err;
                                        }

                                        callbackMain();

                                    });



                                });


                        }, function() {

                            return res.send({
                                success: true
                            });

                        });

                    } else {
                        return res.send({
                            success: true
                        });
                    }

                });

            } else {
                return res.send({
                    success: false,
                    message: 'Site not found'
                });
            }

        });

    } else {
        res.sendStatus(401);
    }
}

/*
function adminDeleteUnusedFiles(req, res, next) {
    let site_id = req.params.siteid;
    let checkID = new RegExp("^[0-9a-fA-F]{24}$");

    if ((site_id && checkID.test(site_id))) {

    }
    else {
        res.sendStatus(401);
    }
}*/

/**
 * Add site language @todo briši
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function addLanguage(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (inData.site_id && checkID.test(inData.site_id)) {

        Site.findOne({
                _id: new ObjectId(inData.site_id)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    let exists = false;

                    if (site.languages && site.languages.length > 0) {
                        for (let lang of site.languages) {

                            if (lang.prefix == inData.prefix) {
                                exists = true;
                            }

                        }
                    }

                    if (exists) {
                        return res.send({
                            success: false,
                            message: 'Such language already exists'
                        });
                    } else {

                        if (!site.languages) {
                            site.languages = [];
                        }

                        site.languages.push({
                            language: inData.name,
                            prefix: inData.prefix,
                            main: (site.languages.length > 0) ? false : true
                        });

                        site.save((err) => {

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
                                data: site.languages
                            });

                        });

                    }


                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Add site language @todo briši
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function addImageSize(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }


    let inData = req.body;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (inData.site_id && checkID.test(inData.site_id)) {

        if (inData.height && !isNaN(inData)) {
            return res.send({
                success: false,
                message: 'Please enter number for height'
            });
        }

        Site.findOne({
                _id: new ObjectId(inData.site_id)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    site.image_size.push({
                        name: inData.name,
                        width: inData.width,
                        height: (inData.height) ? inData.height : null,
                        algorithm: inData.algorithm
                    });

                    site.save((err) => {

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
                            data: site.image_size
                        });

                    });

                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }

}

function regenerateImageSizes(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }


    let inData = req.body;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (inData.site_id && checkID.test(inData.site_id)) {


        Site.findOne({
            _id: new ObjectId(req.body.site_id)
        }).select('image_size').exec(function(err, site) {


            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                if (!(site.image_size && site.image_size.length > 0)) {                    
                    return res.send({
                        success: false,
                        message: 'Images sizes are missing'
                    })
                }


                let query = {};
                query['filetype'] = { $regex: 'image', $options: 'i' };
                query['site_id'] = new ObjectId(inData.site_id);

                File.find(query)
                    .exec(function(err, files) {

                        if (err) {
                            logger.log({
                                level: 'error',
                                message: 'Mongo - error',
                                context: __filename,
                                details: `stderr: ${err}`,
                            });

                            throw err;
                        }

                        if (files.length > 0) {


                            async.eachSeries(files, function(file, callback) {

                                for (let i = 0; i < site.image_size.length; i++) {
                                    // we add image size
                                    manipulatorAddImageSize(
                                        site.image_size[i].name,
                                        site.image_size[i].width,
                                        site.image_size[i].height,
                                        site.image_size[i].algorithm
                                    );
                                }


                                let imagePath = file.filepath;
                                let destination = path.dirname(file.filepath);
                                let destinationFileName = file.filename;

                                let imageManipulation = manipulatorDifferentSizeGenerator(
                                    imagePath,
                                    destination,
                                    destinationFileName
                                );

                                imageManipulation.then((val) => {


                                    let file_dimensions = [];
                                    for (let i = 0; i < val.length; i++) {
                                        file_dimensions.push({
                                            name: val[i].name,
                                            filename: val[i].filename
                                        })
                                    }

                                    File.updateOne({
                                        _id: file._id,
                                        site_id: new ObjectId(inData.site_id)
                                    }, {
                                        $set: {
                                            file_dimensions: file_dimensions
                                        }
                                    }, {
                                        multi: true
                                    }).exec(function(err, data) {

                                        if (err) {
                                            logger.log({
                                                level: 'error',
                                                message: 'Mongo - error',
                                                context: __filename,
                                                details: `stderr: ${err}`,
                                            });

                                            throw err;
                                        }

                                        callback();

                                    })

                                }).catch(err => {
                                    console.log(err);
                                    console.log(file);

                                    // if image doesnt exist we delete from database

                                    File.remove({
                                        '_id': file._id,
                                        'site_id': new ObjectId(inData.site_id)
                                    }, function(err) {

                                        if (err) {
                                            logger.log({
                                                level: 'error',
                                                message: 'Mongo - error',
                                                context: __filename,
                                                details: `stderr: ${err}`,
                                            });

                                            throw err;
                                        }

                                        callback();

                                    });



                                })




                            }, function() {

                                return res.send({
                                    success: true
                                });

                            });




                        } else {
                            return res.send({
                                success: false,
                                message: 'No images'
                            })
                        }



                    });





            } else {
                return res.send({
                    success: false,
                    message: 'Site not found'
                })
            }

        });


    } else {
        res.sendStatus(401);
    }

}

function deleteImageSize(req, res, next) {

    let siteid = req.params.siteid;
    let position = req.params.position;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (!isNaN(position))) {


        Site.findOne({
                _id: new ObjectId(siteid)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    site.image_size.splice(position, 1);

                    site.save((err) => {

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
                            success: true
                        });

                    });

                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });


    } else {
        return res.sendStatus(401);
    }

}

/**
 * Get site info for settings
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getSettingsSiteInfo(req, res, next) {

    let site_id = req.params.site_id;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (site_id && checkID.test(site_id)) {

        Site.findOne({
                _id: new ObjectId(site_id)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {
                    return res.send({
                        success: true,
                        data: site
                    });
                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Get site info for posts/pages - language multilanguage
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getPostSiteInfo(req, res, next) {

    let site_id = req.params.site_id;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (site_id && checkID.test(site_id)) {

        Site.findOne({
                _id: new ObjectId(site_id)
            })
            .select('multilanguage languages main_lang_prefix cookies_enabled cookies_info chat_settings chat_enabled')
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {
                    return res.send({
                        success: true,
                        data: site
                    });
                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }

}

function slugify(input) {
    if (input) {

        const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
        const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnooooooooprrsssssttuuuuuuuuuwxyyzzz------'
        const p = new RegExp(a.split('').join('|'), 'g')

        return input.toString().toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
            .replace(/&/g, '-and-') // Replace & with 'and'
            .replace(/[^\w\-]+/g, '') // Remove all non-word characters
            .replace(/\-\-+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, '') // Trim - from end of text
    }
}

/**
 * Update site general settings
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function updateSiteSettings(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let site_id = req.params.siteid;
    let inData = req.body;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (site_id && checkID.test(site_id)) {

        Site.findOne({
                _id: new ObjectId(site_id)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    let previousLang = site.main_lang_prefix;
                    let mainLang = null;

                    site.title = inData.title;
                    site.domain = inData.domain;
                    site.seo = inData.seo;
                    site.public = inData.public;
                    site.multilanguage = inData.multilanguage;
                    site.sitemap_enabled = inData.sitemap_enabled;

                    let oldSitemapName = site.sitemap_name;
                    // we generate sitemap name
                    site.sitemap_name = slugify(site.domain) + '.xml';

                    // we generate the sitemap
                    sitemapGenerator.generateSitemap(
                        site._id,
                        site.domain,
                        oldSitemapName,
                        site.sitemap_name,
                        site.sitemap_enabled
                    ).then((data) => {


                        /**
                         * We add languages
                         */
                        if (inData.languages && inData.languages.length > 0) {

                            site.languages = [];

                            for (let lang of inData.languages) {

                                if (lang.main) {
                                    mainLang = lang.prefix;
                                }

                                site.languages.push({
                                    language: lang.language,
                                    prefix: lang.prefix,
                                    main: lang.main
                                });

                            }

                        }

                        site.main_lang_prefix = mainLang;

                        /**
                         * Change site links - based on the multilanguage
                         */

                        translateHelper.translatePostSlug(['Post', 'Product', 'Brand', 'Property', 'Category'], previousLang, site_id, mainLang).then((data) => {

                            site.save((err) => {

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
                                    success: true
                                });

                            });

                        });



                    });




                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Get product settings
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getProductSiteSettings(req, res, next) {
    let site_id = req.params.site_id;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (site_id && checkID.test(site_id)) {

        Site.findOne({
                _id: new ObjectId(site_id)
            })
            .select('product_settings')
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }
                if (site) {
                    return res.send({
                        success: true,
                        data: site
                    });
                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }
}

/**
 * Update product settings
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function updateProductSiteSettings(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let site_id = req.params.siteid;
    let inData = req.body;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (site_id && checkID.test(site_id)) {

        Site.findOne({
                _id: new ObjectId(site_id)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    let data = {}

                    if (inData.show_form == 'true') {
                        data['show_form'] = true;
                    } else {
                        data['show_form'] = false;
                    }

                    if (inData.form_id && checkID.test(inData.form_id)) {
                        data['form_id'] = new ObjectId(inData.form_id);
                    }

                    site.product_settings = data;

                    site.save((err) => {

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
                            success: true
                        });

                    });


                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }
}


/**
 * Add forms
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function addForm(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (inData.site_id && checkID.test(inData.site_id)) {

        let site_id = inData.site_id;

        Site.findOne({
                _id: new ObjectId(site_id)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    /**
                     * We add the form
                     */
                    let newForm = new Form();
                    newForm.name = inData.name;
                    newForm.site_id = inData.site_id;
                    newForm.user_id = new ObjectId(req.user._id);

                    if (newForm.recipients) {
                        newForm.recipients = inData.recipients;
                    }
                    if (newForm.email) {
                        newForm.email = inData.email;
                    }
                    if (inData.submit_btn) {
                        newForm.submit_btn = inData.submit_btn;
                    }
                    if (inData.html) {
                        newForm.html = inData.html;
                    }

                    if (inData.elements && inData.elements.length) {
                        newForm.elements = [];

                        for (let i = 0; i < inData.elements.length; i++) {

                            if (inData.elements[i].name && inData.elements[i].type && inData.elements[i].label) {

                                newForm.elements.push({
                                    type: inData.elements[i].type,
                                    name: inData.elements[i].name,
                                    label: inData.elements[i].label,
                                    required: inData.elements[i].required,
                                });

                            }

                        }
                    }

                    newForm.save((err) => {

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
                            data: newForm._id
                        });

                    });

                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });


    } else {
        return res.sendStatus(401);
    }

}

/**
 * Update form forms
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function updateForm(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let form_id = req.params.id;

    let inData = req.body;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (
        inData.site_id &&
        checkID.test(inData.site_id) &&
        form_id &&
        checkID.test(form_id)
    ) {

        let site_id = inData.site_id;

        Site.findOne({
                _id: new ObjectId(site_id)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {


                    Form.findOne({
                            _id: new ObjectId(form_id)
                        })
                        .exec(function(err, form) {

                            if (err) {
                                logger.log({
                                    level: 'error',
                                    message: 'Mongo - error',
                                    context: __filename,
                                    details: `stderr: ${err}`,
                                });

                                throw err;
                            }

                            if (form) {

                                form.name = inData.name;
                                form.recipients = inData.recipients;
                                form.email = inData.email;
                                form.submit_btn = inData.submit_btn;
                                form.html = inData.html;

                                if (inData.elements && inData.elements.length) {

                                    form.elements = [];

                                    for (let i = 0; i < inData.elements.length; i++) {

                                        if (inData.elements[i].name && inData.elements[i].type && inData.elements[i].label) {

                                            form.elements.push({
                                                type: inData.elements[i].type,
                                                name: inData.elements[i].name,
                                                label: inData.elements[i].label,
                                                required: (inData.elements[i].required) ? inData.elements[i].required: false
                                            });

                                        }

                                    }

                                } else {
                                    form.elements = [];
                                }

                                form.save((err) => {

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
                                        data: form._id
                                    });

                                });


                            } else {
                                return res.send({
                                    success: false,
                                    message: 'Form not found'
                                });
                            }

                        });

                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });


    }
    else {
        return res.sendStatus(401);
    }

}

/**
 * Update form forms
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getForm(req, res, next) {

    let siteid = req.params.siteid;
    let formid = req.params.formid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (formid && checkID.test(formid))) {

        Form.findOne({
                '_id': formid,
                'site_id': siteid
            })
            .exec(function(err, form) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (form) {

                    return res.send({
                        success: true,
                        data: form
                    });

                } else {

                    return res.send({
                        success: false,
                        message: 'Form not found'
                    });

                }
            });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Get form submissions
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getFormsSubmissions(req, res, next) {

    let siteid = req.params.siteid;
    let formid = req.params.formid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (formid && checkID.test(formid))) {

        FormSubmit.find({
                'form_id': formid,
                'site_id': siteid
            })
            .exec(function(err, submissions) {

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
                    data: submissions
                });


            });

    } else {
        res.sendStatus(401);
    }

}

function deleteFormsSubmissions(req, res) {

    let siteid = req.params.siteid;
    let formid = req.params.formid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (formid && checkID.test(formid))) {

        FormSubmit.remove({
                'form_id': formid,
                'site_id': siteid
            })
            .exec(function(err) {

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
                    success: true
                });


            });

    } else {
        res.sendStatus(401);
    }

}

function getFormPublic(req, res, next) {

    let siteid = req.params.siteid;
    let formid = req.params.formid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (formid && checkID.test(formid))) {

        Form.findOne({
                '_id': formid,
                'site_id': siteid
            })
            .select('elements submit_btn html')
            .exec(function(err, form) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (form) {

                    return res.send({
                        success: true,
                        data: form
                    });

                } else {

                    return res.send({
                        success: false,
                        message: 'Form not found'
                    });

                }
            });

    } else {
        return res.send({
            success: false,
            message: 'Form not found'
        });
    }

}


function deleteForm(req, res, next) {

    let siteid = req.params.siteid;
    let formid = req.params.formid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (formid && checkID.test(formid))) {

        Form.deleteOne({
                '_id': formid,
                'site_id': siteid
            })
            .exec(function(err) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                FormSubmit.remove({
                    '_id': formid,
                    'site_id': siteid
                }).exec(function(err) {

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
                        success: true
                    });

                });

            });

    } else {
        return res.sendStatus(401);
    }

}

/**
 * Public form posting
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function postFormPublic(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    var inData = req.body;

    Form.findOne({
            '_id': inData.form_id,
            'site_id': inData.site_id
        })
        .exec(function(err, form) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (form) {

                let validated = true;
                let saveObject = [];

                if(form.elements && form.elements.length > 0) {
                    if(inData.data && Object.keys(inData.data).length) {
                        for (let f of form.elements) {

                            if (f.required) {

                                if (!inData.data[f.name]) {
                                    validated = false;
                                } else {
                                    saveObject.push({
                                        value: inData.data[f.name],
                                        name: f.name
                                    });
                                }

                            }

                        }
                    }
                    else {
                        validated = false;
                    }
                }
                else {
                    validated = false;
                }

                if (validated) {

                    let formSubmit = new FormSubmit();
                    formSubmit.elements = saveObject;
                    formSubmit.site_id = form.site_id;
                    formSubmit.form_id = form._id;
                    formSubmit.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                    formSubmit.location = inData.location;

                    if(form.recipients && form.email) {
                        // we add data to template
                        let generatedHtml = ''
                        let template = handlebars.compile(form.email);

                        let json = {};
                        for (let saved of saveObject) {
                            json[saved.name] = saved.value
                        }

                        // generate HTML
                        generatedHtml = template(json);

                        email.sendEmail(
                            form.recipients,
                            'Inquiry - ' + form.name,
                            generatedHtml.replace(/<[^>]*>?/gm, ''),
                            'inquiry.html', {
                                message: generatedHtml
                            },
                            null,
                            (error, msg) => {

                                formSubmit.emailSent = !error;
                                formSubmit.errorMessageMail = msg;

                                formSubmit.save((err) => {

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
                                        success: true
                                    });

                                });

                            }
                        );
                    }
                    else {
                        formSubmit.emailSent = false;
                        formSubmit.errorMessageMail = 'No email template';

                        formSubmit.save((err) => {

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
                                success: true
                            });

                        });
                    }



                } else {
                    return res.send({
                        success: false
                    });
                }



            } else {

                return res.send({
                    success: false,
                    message: 'Form not found'
                });

            }

        });

}


/**
 * Get all forms from site
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getForms(req, res, next) {

    let site_id = req.params.site_id;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (site_id && checkID.test(site_id)) {

        let query = {
            site_id: site_id
        };

        if (req.params.lang) {
            query['']
        }

        Form.find(query)
            .populate('user_id')
            .sort({
                date_created: 1
            })
            .exec(function(err, forms) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                res.send({
                    success: true,
                    data: forms
                });

            });



    } else {
        res.sendStatus(401);
    }

}

/**
 * Delete specific post
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function deletePost(req, res, next) {

    var postid = req.params.postid;

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (postid && checkID.test(postid))) {

        Site.findOne({
                _id: new ObjectId(id)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    let checkMenu = new Promise(function(resolve, reject) {

                        if (site.menus) {

                            for (let i = 0; i < site.menus.length; i++) {


                                for (let j = 0; j < site.menus[i].menu.length; j++) {

                                    if (site.menus[i].menu[j].pages) {

                                        for (let k = 0; k < site.menus[i].menu[j].pages.length; k++) {

                                            let removed = false;

                                            // 1. nivo
                                            if (site.menus[i].menu[j].pages[k].page_id.toString() == postid) {
                                                site.menus[i].menu[j].pages.splice(k, 1);
                                                k--;
                                                removed = true;
                                            }

                                            // 2. nivo
                                            if (!removed) {
                                                if (site.menus[i].menu[j].pages[k].children) {

                                                    for (let l = 0; l < site.menus[i].menu[j].pages[k].children.length; l++) {

                                                        let removed = false;

                                                        if (site.menus[i].menu[j].pages[k].children[l].page_id.toString() == postid) {
                                                            site.menus[i].menu[j].pages[k].children.splice(l, 1);
                                                            l--;
                                                            removed = true;
                                                        }

                                                        // 3. nivo
                                                        if (!removed) {
                                                            if (site.menus[i].menu[j].pages[k].children[l].children) {

                                                                for (let m = 0; m < site.menus[i].menu[j].pages[k].children[l].children.length; m++) {

                                                                    if (site.menus[i].menu[j].pages[k].children[l].children[m].page_id.toString() == postid) {
                                                                        site.menus[i].menu[j].pages[k].children[l].children.splice(m, 1);
                                                                        m--;
                                                                    }

                                                                }

                                                            }
                                                        }

                                                    }
                                                }

                                            }

                                        }

                                    }

                                }


                            }

                            site.save(function(err) {

                                if (err) {
                                    logger.log({
                                        level: 'error',
                                        message: 'Mongo - error',
                                        context: __filename,
                                        details: `stderr: ${err}`,
                                    });

                                    throw err;
                                }

                                resolve(true);

                            });

                        } else {
                            resolve(true);
                        }

                    });


                    checkMenu.then((user) => {

                        Post.deleteOne({
                            _id: postid,
                            site_id: id
                        }, (err) => {

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
                                success: true
                            });

                        });


                    });



                } else {
                    return res.send({
                        success: false
                    });
                }


            });


    } else {
        res.sendStatus(401);
    }

}


function archivePost(req, res, next) {

    var postid = req.params.postid;

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (postid && checkID.test(postid))) {

        Post.findOne({
            _id: postid,
            site_id: id
        }, (err, post) => {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            post.deleted = true;

            post.save((err) => {

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
                    success: true
                });

            });

        });

    } else {
        res.sendStatus(401);
    }

}

function restorePost(req, res, next) {

    var postid = req.params.postid;

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (postid && checkID.test(postid))) {

        Post.findOne({
            _id: postid,
            site_id: id
        }, (err, post) => {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            post.deleted = false;

            post.save((err) => {

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
                    success: true
                });

            });

        });

    } else {
        res.sendStatus(401);
    }

}

function permanentlyDelete(req, res, next) {

    var postid = req.params.postid;

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (postid && checkID.test(postid))) {

        Post.deleteOne({
            _id: postid,
            site_id: id
        }, (err, post) => {

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
                success: true
            });

        });

    } else {
        res.sendStatus(401);
    }

}


function emptyArchive(req, res, next) {

    let siteid = req.params.siteid;
    let type = (req.params.type == 'pages') ? 'page' : 'post';

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (siteid && checkID.test(siteid)) {

        Post.remove({
                'site_id': siteid,
                'deleted': true,
                'type': type
            })
            .exec(function(err, post) {

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
                    success: true
                });

            });

    } else {
        res.sendStatus(401);
    }
}

/**
 * Get all users from site 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getBrands(req, res, next) {

    let lang = req.params.lang;
    let langRestrict = false;

    if (lang != 'undefined') {
        langRestrict = !(lang == 'all');
    }

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        let query = {
            site_id: id
        };

        if (langRestrict) {
            query['lang_prefix'] = lang;
        }

        Brand.find(query).populate('user_id').exec(function(err, brands) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (brands.length > 0) {
                return res.send({
                    success: true,
                    count: brands.length,
                    data: brands
                });
            } else {
                return res.send({
                    success: true,
                    count: 0,
                    data: []
                });
            }
        });

    } else {
        res.sendStatus(401);
    }

}


function saveBrandOrder(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    Brand.findOne({
        'site_id': inData.site_id,
        '_id': inData.brand_id
    }).exec(function(err, brand) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (brand) {

            if (inData.sort_number != undefined && !isNaN(inData.sort_number)) {
                brand.sort = inData.sort_number;
            }

            brand.save((err) => {

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
                    success: true
                })

            })

        } else {
            return res.send({
                success: false
            })
        }

    });


}

/**
 * Add brand for products
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function addBrand(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    Site.findOne({
        '_id': inData.site_id,
    }).exec(function(err, site) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (site) {

            let brand = new Brand();
            brand.name = inData.name;
            brand.description = inData.description;
            if (inData.logo && inData.logo.url) {
                brand.logo = inData.logo.url;
            }
            if (inData.lang) {
                brand.lang_prefix = inData.lang;
            }
            brand.user_id = new ObjectId(req.user._id);
            brand.site_id = site._id;
            brand.save((err) => {

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
                    data: brand._id
                });

            });

        } else {
            return res.send({
                success: false,
                message: 'Site doesn\'t not exist'
            })
        }

    });
}

/**
 * Update brand for products
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function updateBrand(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    let brandid = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (brandid && checkID.test(brandid)) {

        Site.findOne({
            '_id': inData.site_id,
        }).exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                Brand.findOne({
                    '_id': brandid,
                }).exec(function(err, brand) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }


                    if (!brand) {
                        return res.send({
                            success: false,
                            message: 'Brand doesn\'t not exist'
                        })
                    } else {

                        brand.name = inData.name;
                        brand.description = inData.description;
                        if (inData.logo && inData.logo.url) {
                            brand.logo = inData.logo.url;
                        }
                        if (inData.lang) {
                            brand.lang_prefix = inData.lang;
                        }
                        brand.user_id = new ObjectId(req.user._id);
                        brand.site_id = site._id;
                        brand.save((err) => {

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
                                success: true
                            });

                        });

                    }

                });

            } else {
                return res.send({
                    success: false,
                    message: 'Site doesn\'t not exist'
                })
            }

        });

    } else {
        res.sendStatus(401);
    }

}


/**
 * Delete specific brand
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function deleteBrand(req, res, next) {

    var brandid = req.params.brandid;
    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (brandid && checkID.test(brandid))) {

        Brand.deleteOne({
            '_id': brandid,
            'site_id': id,
        }).exec(function(err, brand) {

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
                success: true
            });

        });

    } else {
        res.sendStatus(401);
    }


}

/**
 * Geta all users from site 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getProperties(req, res, next) {

    let lang = req.params.lang;
    let langRestrict = false;

    if (lang != 'undefined') {
        langRestrict = !(lang == 'all');
    }

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        let query = {
            'site_id': id
        }

        if (langRestrict) {
            query['lang_prefix'] = lang;
        }

        Property.find(query).populate('user_id').exec(function(err, properties) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (properties.length > 0) {

                async function countProperties() {

                    for (let i = 0; i < properties.length; i++) {
                        await new Promise(resolve => {

                            Product.countDocuments({
                                    'properties': properties[i]._id
                                })
                                .populate('user_id').exec(function(err, count) {

                                    if (err) {
                                        logger.log({
                                            level: 'error',
                                            message: 'Mongo - error',
                                            context: __filename,
                                            details: `stderr: ${err}`,
                                        });

                                        throw err;
                                    }

                                    properties[i].counter = count;

                                    resolve(count);

                                });

                        });
                    }

                }

                countProperties().then(function() {

                    return res.send({
                        success: true,
                        count: properties.length,
                        data: properties
                    });

                });




            } else {
                return res.send({
                    success: true,
                    count: 0,
                    data: []
                });
            }
        });

    } else {
        res.sendStatus(401);
    }

}

function isArray(a) {
    return (!!a) && (a.constructor === Array);
}

/**
 * Add brand for products
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function addProperty(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    Site.findOne({
        '_id': inData.site_id,
    }).exec(function(err, site) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (site) {

            let property = new Property();
            property.name = inData.name;
            property.user_id = new ObjectId(req.user._id);
            property.site_id = site._id;
            if (inData.lang) {
                property.lang_prefix = inData.lang;
            }

            if (inData.category && isArray(inData.category)) {

                if (inData.category.length == 0) {
                    property.category = [];
                } else {

                    property.category = [];

                    for (let cat of inData.category) {

                        property.category.push(cat);

                    }

                }


            }

            property.save((err) => {

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
                    data: property._id
                });

            });

        } else {
            return res.send({
                success: false,
                message: 'Site doesn\'t not exist'
            })
        }

    });
}

/**
 * Update brand for products
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function updateProperty(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    let propertyId = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (propertyId && checkID.test(propertyId)) {

        Site.findOne({
            '_id': inData.site_id,
        }).exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                Property.findOne({
                    '_id': propertyId,
                }).exec(function(err, property) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }


                    if (!property) {
                        return res.send({
                            success: false,
                            message: 'Property doesn\'t not exist'
                        })
                    } else {

                        property.name = inData.name;
                        property.user_id = new ObjectId(req.user._id);
                        property.site_id = site._id;
                        if (inData.lang) {
                            property.lang_prefix = inData.lang;
                        }

                        if (inData.category && isArray(inData.category)) {

                            if (inData.category.length == 0) {
                                property.category = [];
                            } else {

                                property.category = [];

                                for (let cat of inData.category) {

                                    property.category.push(cat);

                                }

                            }


                        }

                        property.save((err) => {

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
                                success: true
                            });

                        });

                    }

                });

            } else {
                return res.send({
                    success: false,
                    message: 'Site doesn\'t not exist'
                })
            }

        });

    } else {
        res.sendStatus(401);
    }

}


/**
 * Delete specific brand
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function deleteProperty(req, res, next) {

    var propertyid = req.params.id;
    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (propertyid && checkID.test(propertyid))) {

        Property.deleteOne({
            '_id': propertyid,
            'site_id': id,
        }).exec(function(err, property) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            //#region custom filter
            Post.find({
                'blocks.options.custom_filter.property': propertyid,
                'site_id': id
            }).exec(function(err, posts) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (posts.length > 0) {

                    async.eachSeries(posts, function(post, callback) {

                        for (let i = 0; i < post.blocks.length; i++) {

                            for (let j = 0; j < post.blocks[i].options.custom_filter.length; j++) {

                                if (post.blocks[i].options.custom_filter[j].property.toString() == propertyid) {
                                    post.blocks[i].options.custom_filter.splice(j, 1);
                                    j--;
                                }

                            }

                        }

                        post.save((err) => {

                            if (err) {
                                logger.log({
                                    level: 'error',
                                    message: 'Mongo - error',
                                    context: __filename,
                                    details: `stderr: ${err}`,
                                });

                                throw err;
                            }

                            callback();

                        });

                    }, function() {

                        return res.send({
                            success: true
                        });

                    });


                } else {
                    return res.send({
                        success: true
                    });
                }

            });
            //#endregion



        });

    } else {
        res.sendStatus(401);
    }


}

function getCatProperties(req, res, next) {

    let lang = req.params.lang;
    let langRestrict = false;

    if (lang != 'undefined') {
        langRestrict = !(lang == 'all');
    }

    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        let query = {
            'site_id': id
        }

        if (langRestrict) {
            query['lang_prefix'] = lang;
        }

        PropertyCategory.find(query).populate('user_id').exec(function(err, categories) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (categories.length > 0) {

                async function getCategories() {

                    for (let i = 0; i < categories.length; i++) {
                        await new Promise(resolve => {

                            Property.find({
                                'category': categories[i]._id,
                                'site_id': id
                            }).sort({
                                sort: 1
                            }).select('name').exec(function(err, properties) {

                                if (err) {
                                    logger.log({
                                        level: 'error',
                                        message: 'Mongo - error',
                                        context: __filename,
                                        details: `stderr: ${err}`,
                                    });

                                    throw err;
                                }

                                categories[i]._doc['properties'] = properties;

                                resolve(true);

                            });



                        });
                    }

                }

                getCategories().then(function() {

                    return res.send({
                        success: true,
                        count: categories.length,
                        data: categories
                    });

                });


            } else {
                return res.send({
                    success: true,
                    count: 0,
                    data: []
                });
            }
        });

    } else {
        res.sendStatus(401);
    }

}

function addCatProperty(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    Site.findOne({
        '_id': inData.site_id,
    }).exec(function(err, site) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (site) {

            let property = new PropertyCategory();
            property.name = inData.name;
            property.user_id = new ObjectId(req.user._id);
            property.site_id = site._id;
            if (inData.lang) {
                property.lang_prefix = inData.lang;
            }

            property.save((err) => {

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
                    data: property._id
                });

            });

        } else {
            return res.send({
                success: false,
                message: 'Site doesn\'t not exist'
            })
        }

    });

}

function updateCatProperty(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    let propertyId = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (propertyId && checkID.test(propertyId)) {

        Site.findOne({
            '_id': inData.site_id,
        }).exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                PropertyCategory.findOne({
                    '_id': propertyId,
                }).exec(function(err, property) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }


                    if (!property) {
                        return res.send({
                            success: false,
                            message: 'Property doesn\'t not exist'
                        })
                    } else {

                        property.name = inData.name;
                        property.user_id = new ObjectId(req.user._id);
                        property.site_id = site._id;
                        if (inData.lang) {
                            property.lang_prefix = inData.lang;
                        }
                        property.save((err) => {

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
                                success: true
                            });

                        });

                    }

                });

            } else {
                return res.send({
                    success: false,
                    message: 'Site doesn\'t not exist'
                })
            }

        });

    } else {
        res.sendStatus(401);
    }

}

function deleteCatProperty(req, res, next) {

    var categoryid = req.params.id;
    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (categoryid && checkID.test(categoryid))) {


        PropertyCategory.deleteOne({
            '_id': categoryid,
            'site_id': id,
        }).exec(function(err, property) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            //#region custom filter
            Post.find({
                'blocks.options.custom_filter.category': categoryid,
                'site_id': id
            }).exec(function(err, posts) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (posts.length > 0) {

                    async.eachSeries(posts, function(post, callback) {

                        for (let i = 0; i < post.blocks.length; i++) {

                            for (let j = 0; j < post.blocks[i].options.custom_filter.length; j++) {

                                if (post.blocks[i].options.custom_filter[j].category.toString() == categoryid) {
                                    post.blocks[i].options.custom_filter.splice(j, 1);
                                    j--;
                                }

                            }

                        }

                        post.save((err) => {

                            if (err) {
                                logger.log({
                                    level: 'error',
                                    message: 'Mongo - error',
                                    context: __filename,
                                    details: `stderr: ${err}`,
                                });

                                throw err;
                            }

                            callback();

                        });

                    }, function() {

                        //#region remove from property
                        Property.find({
                            'category': categoryid,
                            'site_id': id,
                        }).exec(function(err, properties) {

                            if (err) {
                                logger.log({
                                    level: 'error',
                                    message: 'Mongo - error',
                                    context: __filename,
                                    details: `stderr: ${err}`,
                                });

                                throw err;
                            }

                            if (properties.length > 0) {


                                async.eachSeries(properties, function(property, callback) {

                                    for (let i = 0; i < property.category.length; i++) {

                                        if (property.category[i].toString() == categoryid) {
                                            property.category.splice(i, 1);
                                            i--;
                                        }

                                    }

                                    property.save((err) => {

                                        if (err) {
                                            logger.log({
                                                level: 'error',
                                                message: 'Mongo - error',
                                                context: __filename,
                                                details: `stderr: ${err}`,
                                            });

                                            throw err;
                                        }

                                        callback();

                                    });

                                }, function() {

                                    return res.send({
                                        success: true
                                    });

                                });

                            } else {

                                return res.send({
                                    success: true
                                });

                            }

                        });
                        //#endregion                       

                    });


                } else {
                    return res.send({
                        success: true
                    });
                }

            });
            //#endregion

        });

    } else {
        res.sendStatus(401);
    }


}


function getProducts(req, res, next) {

    let id = req.params.siteid;
    let lang = req.params.lang;
    let brand = req.params.brand;


    //#region we setup params
    let offset = 0;
    let index = 0;
    let size = 0;
    let sort = false;
    let direction = false;

    if (!isNaN(req.params.offset)) {
        offset = parseInt(req.params.offset);
    }

    if (!isNaN(req.params.index)) {
        index = parseInt(req.params.index);
    }

    if (!isNaN(req.params.size)) {
        size = parseInt(req.params.size);
    }

    if (req.params.sort != 'undefined') {
        sort = req.params.sort;
    }

    if (req.params.direction != 'undefined') {
        direction = req.params.direction;
    }
    //#endregion

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        let query = {
            site_id: new ObjectId(id)
        }

        let langRestrict = false;

        if (lang != 'undefined') {
            langRestrict = !(lang == 'all');
        }

        if (langRestrict) {
            query['lang_prefix'] = lang;
        }

        if (brand && (brand != 'all')) {

            if (checkID.test(brand)) {

                query['brand_id'] = new ObjectId(brand);

            }

        }

        Product.countDocuments(query).exec(function(err, productNumber) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }


            let defaultSort = {
                sort: 1
            }

            if (sort && direction) {
                defaultSort = {};
                defaultSort[sort] = (direction == 'asc') ? 1 : -1;
            }

            Product.find(query)
                .skip(index * size)
                .limit(size)
                .populate('user_id')
                .populate('brand_id')
                .populate('parent_id')
                .sort(defaultSort)
                .exec(function(err, product) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }

                    if (product.length > 0) {
                        return res.send({
                            success: true,
                            count: productNumber,
                            data: product
                        });
                    } else {
                        return res.send({
                            success: true,
                            count: 0,
                            data: []
                        });
                    }
                });



        });

    } else {
        res.sendStatus(401);
    }

}

function saveProductOrder(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    Product.findOne({
        'site_id': inData.site_id,
        '_id': inData.product_id
    }).exec(function(err, product) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (product) {

            if (inData.sort_number != undefined && !isNaN(inData.sort_number)) {
                product.sort = inData.sort_number;
            }

            product.save((err) => {

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
                    success: true
                })

            })

        } else {
            return res.send({
                success: false
            })
        }

    });


}

function getBrandProducts(req, res, next) {

    let siteid = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    let inData = req.body;

    if ((siteid && checkID.test(siteid))) {

        let query = {
            'site_id': siteid
        };

        let brand_query = {
            'site_id': siteid
        };

        if (inData.brands && inData.brands.length > 0) {


            brand_query['$or'] = [];

            for (let i = 0; i < inData.brands.length; i++) {


                if (checkID.test(inData.brands[i])) {

                    brand_query['$or'].push({
                        '_id': new ObjectId(inData.brands[i])
                    })

                }

            }

            let products_holder = [];

            let limit = 0;
            if (inData.limit && !isNaN(inData.limit)) {
                limit = inData.limit;
            }

            Brand.find(brand_query).sort({
                    sort: 1
                })
                .exec(function(err, brands) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }

                    if (brands.length == 0) {
                        return res.send({
                            success: true,
                            data: []
                        });
                    } else {

                        async.eachSeries(brands, function(brand, cb) {

                            query['brand_id'] = brand._id;

                            Product.find(query)
                                .populate('images.file')
                                .populate('brand_id')
                                .sort({
                                    sort: 1
                                })
                                .limit(limit)
                                .exec(function(err, products) {

                                    if (err) {
                                        logger.log({
                                            level: 'error',
                                            message: 'Mongo - error',
                                            context: __filename,
                                            details: `stderr: ${err}`,
                                        });

                                        throw err;
                                    }

                                    for (let p of products) {
                                        products_holder.push(p);
                                    }

                                    cb();

                                });

                        }, function() {
                            return res.send({
                                success: true,
                                data: products_holder
                            });
                        });

                    }

                });

        } else {
            return res.send({
                success: true,
                data: []
            });
        }


    } else {
        res.sendStatus(401);
    }

}

function getBrandFilterProducts(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');
    let inData = req.body;

    let query = {
        'site_id': inData.site_id
    }

    if (inData.brands && inData.brands.length > 0) {
        query['$or'] = [];

        for (let i = 0; i < inData.brands.length; i++) {


            if (checkID.test(inData.brands[i])) {

                query['$or'].push({
                    'brand_id': new ObjectId(inData.brands[i])
                })

            }

        }
    }

    if (inData.filter && inData.filter.length > 0) {
        query['$and'] = [];

        for (let i = 0; i < inData.filter.length; i++) {
            query['$and'].push({
                'properties': inData.filter[i]
            })
        }
    }

    Product.find(query)
        .populate('images.file')
        .sort({
            sort: 1,
            brand_id: -1
        })
        .exec(function(err, products) {

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
                data: products
            });

        });

}

function getProduct(req, res, next) {

    let siteid = req.params.siteid;
    let productid = req.params.productid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (productid && checkID.test(productid))) {

        Product.findOne({
                '_id': productid,
                'site_id': siteid
            })
            .populate('attachments.file')
            .exec(function(err, product) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (product) {

                    return res.send({
                        success: true,
                        data: product
                    });

                } else {

                    return res.send({
                        success: false,
                        message: 'Product not found'
                    });

                }
            });

    } else {
        res.sendStatus(401);
    }

}

function getProductHierarchy(req, res, next) {

    let siteid = req.params.siteid;
    let brandid = req.params.brandid;
    let productid = req.params.productid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (brandid && checkID.test(brandid))) {

        let query = {
            'brand_id': brandid,
            'site_id': siteid
        };

        if (productid && checkID.test(productid)) {
            query['_id'] = { $ne: productid },
                query['parent_id'] = { $ne: productid }
        } else {
            if (productid != 'none') {
                res.sendStatus(401);
            }
        }

        Product.find(query)
            .populate('brand_id')
            .sort('name')
            .exec(function(err, products) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (products.length > 0) {

                    let preparedData = [];

                    let allProducts = products;
                    let allProductsLength = products.length;
                    let rootElements = [];

                    for (let i = 0; i < allProductsLength; i++) {

                        if (!allProducts[i].parent_id) {
                            rootElements.push(allProducts[i]);
                            allProducts.splice(i, 1);
                            i--;
                            allProductsLength--;
                        }

                    }

                    for (let i = 0; i < rootElements.length; i++) {

                        preparedData.push(rootElements[i]);

                        for (let j = 0; j < allProducts.length; j++) {

                            if (allProducts[j].parent_id.toString() == rootElements[i]._id.toString()) {

                                allProducts[j].name = ' -- ' + allProducts[j].name;

                                preparedData.push(allProducts[j]);
                            }

                        }

                    }

                    return res.send({
                        success: true,
                        data: preparedData //products
                    });

                } else {

                    return res.send({
                        success: true,
                        data: []
                    });

                }
            });

    } else {
        res.sendStatus(401);
    }

}

function addProduct(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    Site.findOne({
        '_id': inData.site_id,
    }).exec(function(err, site) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (site) {

            let product = new Product();
            product.name = inData.name;
            product.brand_id = inData.brand_id;
            product.description = inData.description;
            product.slug = inData.slug;
            product.lang_prefix = (inData.lang) ? inData.lang : null;

            if (inData.excerpt) {
                product.excerpt = inData.excerpt;
            }

            if (inData.parent_id != 'null') {
                product.parent_id = inData.parent_id;
            } else {
                product.parent_id = null;
            }

            if (inData.images && inData.images.length) {
                for (let i = 0; i < inData.images.length; i++) {
                    product.images.push({
                        src: inData.images[i].src,
                        file: inData.images[i].file,
                        hero: inData.images[i].hero
                    });
                }
            }


            if (inData.features && inData.features.length) {
                for (let i = 0; i < inData.features.length; i++) {
                    product.features.push({
                        icon: inData.features[i].icon,
                        name: inData.features[i].name,
                        text: inData.features[i].text
                    });
                }
            }

            if (inData.attachments && inData.attachments.length) {
                for (let i = 0; i < inData.attachments.length; i++) {
                    product.attachments.push({
                        icon: inData.attachments[i].icon,
                        name: inData.attachments[i].name,
                        file: inData.attachments[i].file
                    });
                }
            }

            if (inData.properties && inData.properties.length) {
                for (let i = 0; i < inData.properties.length; i++) {
                    product.properties.push(inData.properties[i]);
                }
            }

            if (inData.meta_keywords != null) {
                product.meta_keywords = inData.meta_keywords;
            }

            if (inData.meta_description != null) {
                product.meta_description = inData.meta_description;
            }

            product.user_id = new ObjectId(req.user._id);
            product.site_id = site._id;
            product.save((err) => {

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
                    data: product._id
                });

            });

        } else {
            return res.send({
                success: false,
                message: 'Site doesn\'t not exist'
            })
        }

    });

}

function updateProduct(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    let productid = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (productid && checkID.test(productid)) {

        Site.findOne({
            '_id': inData.site_id,
        }).exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                Product.findOne({
                    '_id': productid,
                }).exec(function(err, product) {

                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'Mongo - error',
                            context: __filename,
                            details: `stderr: ${err}`,
                        });

                        throw err;
                    }

                    if (!product) {
                        return res.send({
                            success: false,
                            message: 'Product doesn\'t not exist'
                        })
                    } else {

                        product.name = inData.name;
                        product.brand_id = inData.brand_id;
                        product.description = inData.description;
                        product.slug = inData.slug;
                        product.lang_prefix = (inData.lang) ? inData.lang : null;

                        if (inData.excerpt) {
                            product.excerpt = inData.excerpt;
                        }

                        if (inData.parent_id != 'null') {
                            product.parent_id = inData.parent_id;
                        } else {
                            product.parent_id = null;
                        }

                        product.images = [];
                        if (inData.images && inData.images.length) {
                            for (let i = 0; i < inData.images.length; i++) {
                                product.images.push({
                                    src: inData.images[i].src,
                                    file: inData.images[i].file,
                                    hero: inData.images[i].hero
                                });
                            }
                        }

                        product.features = [];
                        if (inData.features && inData.features.length) {
                            for (let i = 0; i < inData.features.length; i++) {
                                product.features.push({
                                    icon: inData.features[i].icon,
                                    name: inData.features[i].name,
                                    text: inData.features[i].text
                                });
                            }
                        }

                        product.attachments = [];
                        if (inData.attachments && inData.attachments.length) {
                            for (let i = 0; i < inData.attachments.length; i++) {
                                product.attachments.push({
                                    icon: inData.attachments[i].icon,
                                    name: inData.attachments[i].name,
                                    file: inData.attachments[i].file
                                });
                            }
                        }

                        product.properties = [];
                        if (inData.properties && inData.properties.length) {
                            for (let i = 0; i < inData.properties.length; i++) {
                                product.properties.push(inData.properties[i]);
                            }
                        }

                        if (inData.meta_keywords != null) {
                            product.meta_keywords = inData.meta_keywords;
                        }

                        if (inData.meta_description != null) {
                            product.meta_description = inData.meta_description;
                        }

                        product.user_id = new ObjectId(req.user._id);
                        product.site_id = site._id;
                        product.save((err) => {

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
                                data: product._id
                            });

                        });

                    }

                });


            } else {
                return res.send({
                    success: false,
                    message: 'Site doesn\'t not exist'
                })
            }

        });

    } else {
        res.sendStatus(401);
    }

}

/**
 * Delete specific product
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function deleteProduct(req, res, next) {

    var productid = req.params.productid;
    let id = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((id && checkID.test(id)) && (productid && checkID.test(productid))) {

        Product.deleteOne({
            '_id': productid,
            'site_id': id,
        }).exec(function(err, product) {

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
                success: true
            });

        });

    } else {
        res.sendStatus(401);
    }


}



/**
 * Under construction
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function underConstructionInfo(req, res, next) {
    let siteid = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (siteid && checkID.test(siteid)) {

        Site.findOne({
                _id: new ObjectId(siteid)
            })
            .select('public')
            .exec(function(err, site) {

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
                    data: site
                });

            });

    } else {
        res.sendStatus(401);
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getPostChildren(req, res, next) {
    let siteid = req.params.siteid;
    let postid = req.params.postid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (postid && checkID.test(postid))) {

        Site.findOne({
                _id: new ObjectId(siteid)
            })
            .populate('menus.menu.pages.page_id')
            .populate('menus.menu.pages.children.page_id')
            .populate('menus.menu.pages.children.children.page_id')
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site && site.menus.length > 0) {

                    let children = [];

                    /**
                     * Different menus
                     */
                    for (let i = 0; i < site.menus.length; i++) {

                        /**
                         * Different languages
                         */
                        for (let j = 0; j < site.menus[i].menu.length; j++) {

                            /**
                             * Children 1st
                             */
                            for (let k = 0; k < site.menus[i].menu[j].pages.length; k++) {


                                if (site.menus[i].menu[j].pages[k].page_id) {

                                    if (postid == site.menus[i].menu[j].pages[k].page_id._id.toString()) {
                                        //console.log('našel')
                                        children = site.menus[i].menu[j].pages[k].children;
                                    }

                                }

                                /**
                                 * Children 2nd
                                 */
                                for (let l = 0; l < site.menus[i].menu[j].pages[k].children.length; l++) {

                                    if (site.menus[i].menu[j].pages[k].children[l].page_id) {

                                        // Children 3rd level - don't need
                                        if (postid == site.menus[i].menu[j].pages[k].children[l].page_id._id.toString()) {
                                            //console.log('našel')
                                            children = site.menus[i].menu[j].pages[k].children[l].children;
                                        }

                                    }


                                }

                            }

                        }

                    }

                    return res.send({
                        success: true,
                        data: children
                    })

                } else {
                    res.sendStatus(401);
                }

            });

    } else {
        res.sendStatus(401);
    }

}

function addShareable(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;
    let sendEmails = [];

    Site.findOne({
        '_id': inData.site_id,
    }).exec(function(err, site) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (site) {

            let shareable = new Shareable();
            shareable.name = inData.name;
            shareable.duration = inData.duration;
            shareable.duration_time = null;
            if (inData.durationTime) {
                shareable.duration_time = inData.durationTime;
            }

            shareable.limit_download = inData.limitDownload;
            if (inData.limitDownload) {
                shareable.download_number = inData.downloadNumber;
            }

            shareable.limit_access = inData.limitAccess;

            shareable.access = [];
            if (inData.access && inData.access.length) {
                for (let i = 0; i < inData.access.length; i++) {
                    shareable.access.push({
                        user_id: inData.access[i]._id
                    });

                    sendEmails.push(inData.access[i].email);
                }
            }

            if (inData.files && inData.files.length) {
                for (let i = 0; i < inData.files.length; i++) {
                    shareable.files.push(inData.files[i]._id);
                }
            }

            shareable.user_id = new ObjectId(req.user._id);
            shareable.site_id = site._id;
            shareable.save((err) => {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                try {

                    if (inData.sendEmail && sendEmails.length > 0) {

                        let link = req.headers.origin + '/portal/';

                        email.sendEmail(
                            sendEmails,
                            'New file share',
                            'Follow this link (' + link + ') to view files.',
                            'message.html', {
                                title: 'KOMPAS Telekom shared files with you - ' + shareable.name,
                                text: 'Click below to view the files',
                                link: link,
                                button_text: 'Check files'
                            }
                        );

                    }

                    return res.send({
                        success: true,
                        data: shareable._id
                    });

                } catch (e) {

                    return res.send({
                        success: false,
                        message: 'Saved, but errors at sending e-mail notification'
                    });

                }

            });

        } else {
            return res.send({
                success: false,
                message: 'Site doesn\'t not exist'
            })
        }

    });

}

function updateShareable(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;
    let sendEmails = [];

    Shareable.findOne({
        _id: new ObjectId(inData.id),
        site_id: new ObjectId(inData.site_id)
    }).exec(function(err, shareable) {

        if (err) {
            logger.log({
                level: 'error',
                message: 'Mongo - error',
                context: __filename,
                details: `stderr: ${err}`,
            });

            throw err;
        }

        if (shareable) {

            shareable.name = inData.name;
            shareable.duration = inData.duration;
            shareable.duration_time = null;
            if (inData.durationTime) {
                shareable.duration_time = inData.durationTime;
            }

            shareable.limit_download = inData.limitDownload;
            if (inData.limitDownload) {
                shareable.download_number = inData.downloadNumber;
            }

            shareable.limit_access = inData.limitAccess;

            //shareable.password = inData.password;
            shareable.access = [];
            if (inData.access && inData.access.length) {
                for (let i = 0; i < inData.access.length; i++) {
                    shareable.access.push({
                        user_id: inData.access[i]._id
                    });

                    sendEmails.push(inData.access[i].email);
                }
            }

            shareable.files = [];

            if (inData.files && inData.files.length) {
                for (let i = 0; i < inData.files.length; i++) {
                    shareable.files.push(inData.files[i]._id);
                }
            }

            shareable.user_id = new ObjectId(req.user._id);
            shareable.save((err) => {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                try {

                    if (inData.sendEmail && sendEmails.length > 0) {

                        let link = req.headers.origin + '/portal/';

                        email.sendEmail(
                            sendEmails,
                            'Updated files',
                            'Follow this link (' + link + ') to view files.',
                            'message.html', {
                                title: 'KOMPAS Telekom has updated shared files with you - ' + shareable.name,
                                text: 'Click below to view the files',
                                link: link,
                                button_text: 'Check files'
                            }
                        );

                    }

                    return res.send({
                        success: true,
                        data: shareable._id
                    });

                } catch (e) {

                    return res.send({
                        success: false,
                        message: 'Error at sending e-mail'
                    });


                }

            });

        } else {
            res.sendStatus(401);
        }

    });

}

function getShareables(req, res, next) {

    let id = req.params.siteid;
    let lang = req.params.lang;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (id && checkID.test(id)) {

        let query = {
            site_id: new ObjectId(id)
        }

        let langRestrict = false;

        if (lang != 'undefined') {
            langRestrict = !(lang == 'all');
        }

        if (langRestrict) {
            query['lang_prefix'] = lang;
        }

        Shareable.find(query).populate('user_id').exec(function(err, shareables) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (shareables.length > 0) {
                return res.send({
                    success: true,
                    count: shareables.length,
                    data: shareables
                });
            } else {
                return res.send({
                    success: true,
                    count: 0,
                    data: []
                });
            }
        });

    } else {
        res.sendStatus(401);
    }

}

function getShareable(req, res) {

    let siteid = req.params.siteid;
    let shareableid = req.params.shareableid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (shareableid && checkID.test(shareableid))) {

        Shareable.findOne({
                '_id': shareableid,
                'site_id': siteid
            })
            .populate('files')
            .populate('downloaded.user_id')
            .exec(function(err, shareable) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (shareable) {

                    return res.send({
                        success: true,
                        data: shareable
                    });

                } else {

                    return res.send({
                        success: false,
                        message: 'Shareable not found'
                    });

                }
            });

    } else {
        res.sendStatus(401);
    }

}

function deleteShareable(req, res) {
    let siteid = req.params.siteid;
    let shareableid = req.params.shareableid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (shareableid && checkID.test(shareableid))) {

        Shareable.findOne({
                '_id': shareableid,
                'site_id': siteid
            })
            .populate('files')
            .exec(function(err, shareable) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (shareable) {

                    async.eachSeries(shareable.files, function(file, callback) {

                        File.remove({
                            _id: file._id,
                            site_id: siteid
                        }, function(err) {

                            if (err) {
                                logger.log({
                                    level: 'error',
                                    message: 'Mongo - error',
                                    context: __filename,
                                    details: `stderr: ${err}`,
                                });

                                throw err;
                            }

                            try {

                                fs.unlink(file.filepath, function(err) {
                                    
                                    if(err) {
                                        logger.log({
                                            level: 'error',
                                            message: 'Unable to delete file - delete file - delete shareable',
                                            context: __filename,
                                            details: `stderr: ${err}`,
                                        });
                                    }

                                    callback();

                                });

                            }
                            catch(e) {
                                logger.log({
                                    level: 'error',
                                    message: 'Unable to delete file - delete file - delete shareable',
                                    context: __filename,
                                    details: `stderr: ${e}`,
                                });

                                callback();
                            }

                        });

                    }, function() {

                        Shareable.deleteOne({
                            '_id': shareableid,
                            'site_id': siteid
                        }, function(err) {

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
                                success: true
                            });

                        });



                    });


                } else {

                    return res.send({
                        success: false,
                        message: 'Shareable not found'
                    });

                }
            });

    } else {
        res.sendStatus(401);
    }
}

function updateCookieSettings(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    Site.findOne({
            _id: new ObjectId(inData.site_id)
        })
        .exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                site.cookies_enabled = inData.cookies_enabled;

                if (inData.cookies && inData.cookies.length > 0) {
                    site.cookies_info = [];

                    for (let i = 0; i < inData.cookies.length; i++) {

                        if (inData.cookies[i].text && inData.cookies[i].agree_text && inData.cookies[i].more_information && inData.cookies[i].lang) {

                            let cookies = [];

                            if (inData.cookies[i].cookies && inData.cookies[i].cookies.length > 0) {
                                for (let j = 0; j < inData.cookies[i].cookies.length; j++) {

                                    cookies.push({
                                        name: inData.cookies[i].cookies[j].name,
                                        text: inData.cookies[i].cookies[j].text
                                    });

                                }
                            }

                            site.cookies_info.push({
                                text: inData.cookies[i].text,
                                agree_text: inData.cookies[i].agree_text,
                                more_information: (inData.cookies[i].more_information) ? inData.cookies[i].more_information : '',
                                cookie_information: (inData.cookies[i].cookie_information) ? inData.cookies[i].cookie_information : '',
                                lang: inData.cookies[i].lang,
                                cookies: (cookies.length > 0) ? cookies : null
                            });

                        } else {
                            return res.sendStatus(401);
                        }

                    }

                }

                site.save((err) => {

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
                        success: true
                    });

                });

            } else {
                return res.send({
                    success: false,
                    message: 'Site not found'
                });
            }

        });


}

/**
 * Get system version
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getSystemVersion(req, res, next) {

    let jsonfile = fs.readFileSync(path.join(__dirname, '../package.json'));

    let packageJson = JSON.parse(jsonfile);
    let version = 'N/A';

    if (packageJson && packageJson.version) {
        version = packageJson.version;
    }

    return res.send({
        success: true,
        data: version
    });
}

/**
 * Get system fa icons
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getSystemFaIcons(req, res, next) {

    let icons = require('../config/icons');
    delete require.cache[require.resolve('../config/icons')]; // move script from the cache

    return res.send({
        success: true,
        data: icons
    });

}


function getGoogleMapsAPI(req, res, next) {
    let siteid = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (siteid && checkID.test(siteid)) {

        Site.findOne({
                _id: new ObjectId(siteid)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {
                    return res.send({
                        success: true,
                        data: {
                            api: (site.google_maps_api) ? site.google_maps_api : ''
                        }
                    });
                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }
}


function updateGoogleMapsAPI(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    Site.findOne({
            _id: new ObjectId(inData.site_id)
        })
        .exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                site.google_maps_api = inData.api;

                site.save((err) => {

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
                        success: true
                    });

                });


            } else {
                return res.send({
                    success: false,
                    message: 'Site not found'
                });
            }

        });


}



function getGoogleAnalyticsAPI(req, res, next) {
    let siteid = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (siteid && checkID.test(siteid)) {

        Site.findOne({
                _id: new ObjectId(siteid)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {
                    return res.send({
                        success: true,
                        data: {
                            api: (site.google_analytics_api) ? site.google_analytics_api : ''
                        }
                    });
                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }
}

function updateGoogleAnalyticsAPI(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    Site.findOne({
            _id: new ObjectId(inData.site_id)
        })
        .exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                site.google_analytics_api = inData.api;

                site.save((err) => {

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
                        success: true
                    });

                });


            } else {
                return res.send({
                    success: false,
                    message: 'Site not found'
                });
            }

        });


}


function getChatbotSettings(req, res, next) {
    let siteid = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (siteid && checkID.test(siteid)) {

        Site.findOne({
                _id: new ObjectId(siteid)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {
                    return res.send({
                        success: true,
                        data: {
                            chat_enabled: (site.chat_enabled) ? site.chat_enabled : false,
                            chat_settings: site.chat_settings
                        }
                    });
                } else {
                    return res.send({
                        success: false,
                        message: 'Site not found'
                    });
                }

            });

    } else {
        res.sendStatus(401);
    }
}

function updateChatBotSettings(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let inData = req.body;

    Site.findOne({
            _id: new ObjectId(inData.site_id)
        })
        .exec(function(err, site) {

            if (err) {
                logger.log({
                    level: 'error',
                    message: 'Mongo - error',
                    context: __filename,
                    details: `stderr: ${err}`,
                });

                throw err;
            }

            if (site) {

                site.chat_enabled = inData.chat_enabled;

                if (site.chat_enabled) {

                    let chat_settings = {};

                    if (inData.text_data && inData.text_data.length > 0) {

                        chat_settings.text = [];

                        for (let i = 0; i < inData.text_data.length; i++) {

                            chat_settings.text.push({
                                lang: inData.text_data[i].lang,
                                intro_text: inData.text_data[i].intro_text,
                                intro_btn: inData.text_data[i].intro_btn,
                                contact_text: inData.text_data[i].contact_text,
                                your_name: inData.text_data[i].your_name,
                                your_email: inData.text_data[i].your_email,
                                privacy_text: inData.text_data[i].privacy_text,
                                privacy_link: inData.text_data[i].privacy_link,
                                continue_text: inData.text_data[i].continue_text,
                                welcome_text: inData.text_data[i].welcome_text,
                                write_message: inData.text_data[i].write_message
                            });

                        }

                    }

                    chat_settings.working_hours_enabled = inData.working_hours_enabled;

                    if (inData.working_hours_enabled &&
                        inData.working_hours_type &&
                        inData.working_hours &&
                        inData.working_hours.length > 0
                    ) {

                        try {

                            chat_settings.working_hours = [];

                            for (let i = 0; i < inData.working_hours.length; i++) {

                                chat_settings.working_hours.push({
                                    day: inData.working_hours[i].day,
                                    from_hour: inData.working_hours[i].fromHour,
                                    from_minutes: inData.working_hours[i].fromMinutes,
                                    to_hour: inData.working_hours[i].toHour,
                                    to_minutes: inData.working_hours[i].toMinutes,
                                    closed: (inData.working_hours[i].closed) ? true : false
                                });

                            }

                            chat_settings.working_hours_type = inData.working_hours_type;

                        } catch (e) {

                            chat_settings.working_hours_type = false;

                        }

                        site.chat_settings = chat_settings;


                    }

                }

                site.save((err) => {

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
                        success: true
                    });

                });


            } else {
                return res.send({
                    success: false,
                    message: 'Site not found'
                });
            }

        });


}

function prepareTransferFile(req, res, next) {

    let siteid = req.params.siteid;
    let id = req.params.id;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (id && checkID.test(id))) {




        File.findOne({
                _id: new ObjectId(id),
                site_id: new ObjectId(siteid)
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

                    // we move file
                    fs.copyFile(file.filepath, path.join(__dirname, '../download/' + file._id.toString()), (err) => {
                        if (err) {
                            logger.log({
                                level: 'error',
                                message: 'Copy file - error',
                                context: __filename,
                                details: `stderr: ${err}`,
                            });

                            throw err;
                        }

                        let downloadManager = new DownloadManager();
                        downloadManager.filepath = path.join(__dirname, '../download/' + file._id.toString());
                        downloadManager.site_id = siteid;
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
                                data: file._id.toString()
                            });
                        });

                    });


                    // we return link


                } else {
                    return res.send({
                        success: false,
                        message: 'File not found'
                    });
                }
            });




    } else {
        res.sendStatus(401);
    }

}

function getDashStats(req, res, next) {

    let siteid = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid))) {

        Site.findOne({
                _id: new ObjectId(siteid)
            })
            .exec(function(err, site) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (site) {

                    // get stats
                    async.series([
                            function(callback) {

                                Post.countDocuments({
                                    site_id: siteid,
                                    type: 'page'
                                }).exec(function(err, number) {

                                    if (err) {
                                        logger.log({
                                            level: 'error',
                                            message: 'Mongo - error',
                                            context: __filename,
                                            details: `stderr: ${err}`,
                                        });

                                        throw err;
                                    }

                                    Post.find({
                                        site_id: siteid,
                                        type: 'page'
                                    }).sort({
                                        date_created: -1
                                    }).limit(3).exec(function(err, posts) {

                                        if (err) {
                                            logger.log({
                                                level: 'error',
                                                message: 'Mongo - error',
                                                context: __filename,
                                                details: `stderr: ${err}`,
                                            });

                                            throw err;
                                        }

                                        callback(null, {
                                            number: number,
                                            data: posts
                                        })

                                    });

                                });

                            },
                            function(callback) {
                                Post.countDocuments({
                                    site_id: siteid,
                                    type: 'post'
                                }).exec(function(err, number) {

                                    if (err) {
                                        logger.log({
                                            level: 'error',
                                            message: 'Mongo - error',
                                            context: __filename,
                                            details: `stderr: ${err}`,
                                        });

                                        throw err;
                                    }

                                    Post.find({
                                        site_id: siteid,
                                        type: 'post'
                                    }).sort({
                                        date_created: -1
                                    }).limit(3).exec(function(err, posts) {

                                        if (err) {
                                            logger.log({
                                                level: 'error',
                                                message: 'Mongo - error',
                                                context: __filename,
                                                details: `stderr: ${err}`,
                                            });

                                            throw err;
                                        }

                                        callback(null, {
                                            number: number,
                                            data: posts
                                        })

                                    });

                                });
                            },
                            function(callback) {
                                Product.countDocuments({
                                    site_id: siteid
                                }).exec(function(err, number) {

                                    if (err) {
                                        logger.log({
                                            level: 'error',
                                            message: 'Mongo - error',
                                            context: __filename,
                                            details: `stderr: ${err}`,
                                        });

                                        throw err;
                                    }

                                    Product.find({
                                        site_id: siteid
                                    }).sort({
                                        date_created: -1
                                    }).limit(3).exec(function(err, posts) {

                                        if (err) {
                                            logger.log({
                                                level: 'error',
                                                message: 'Mongo - error',
                                                context: __filename,
                                                details: `stderr: ${err}`,
                                            });

                                            throw err;
                                        }

                                        callback(null, {
                                            number: number,
                                            data: posts
                                        })

                                    });

                                });
                            }
                        ],
                        // optional callback
                        function(err, results) {
                            // results is now equal to ['one', 'two']

                            return res.send({
                                success: true,
                                data: results
                            });

                        });

                } else {
                    return res.sendStatus(404);
                }
            });

    } else {
        res.sendStatus(401);
    }

}

function getActiveUsers(req, res, next) {

    let siteid = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid))) {

        let users = websocket.getUsers(siteid);

        return res.send({
            success: true,
            data: users
        });

    } else {
        res.sendStatus(401);
    }

}


/**
 * Geta chats
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getChats(req, res, next) {

    let siteid = req.params.siteid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (siteid && checkID.test(siteid)) {

        Chat.find({
                'site_id': siteid
            }).sort({
                date_created: -1
            })
            .exec(function(err, chats) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (chats) {

                    return res.send({
                        success: true,
                        data: chats,
                        count: chats.length
                    });

                } else {
                    return res.send({
                        success: false
                    });
                }
            });

    } else {
        res.sendStatus(401);
    }

}

function getChat(req, res, next) {

    let siteid = req.params.siteid;
    let chatid = req.params.chatid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid))) {

        Chat.findOne({
                'chat_id': chatid,
                'site_id': new ObjectId(siteid)
            })
            .exec(function(err, chat) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (chat) {

                    return res.send({
                        success: true,
                        data: chat
                    });

                } else {
                    return res.send({
                        success: false
                    });
                }
            });

    } else {
        res.sendStatus(401);
    }

}

function deleteChat(req, res, next) {

    let siteid = req.params.siteid;
    let chatid = req.params.chatid;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if ((siteid && checkID.test(siteid)) && (chatid && checkID.test(chatid))) {

        Chat.remove({
                '_id': new ObjectId(chatid),
                'site_id': siteid
            })
            .exec(function(err, chat) {

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
                    success: true
                });

            });

    } else {
        res.sendStatus(401);
    }

}

function searchPosts(req, res, next) {

    let siteid = req.params.siteid;
    let search = req.params.search;
    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (siteid && checkID.test(siteid)) {

        async.series([
                function(callback) {

                    if (!search) {

                        Post.find({
                                site_id: new ObjectId(siteid)
                            })
                            .sort({
                                date_created: -1
                            })
                            .limit(5)
                            .exec(function(err, posts) {

                                if (err) {
                                    logger.log({
                                        level: 'error',
                                        message: 'Mongo - error',
                                        context: __filename,
                                        details: `stderr: ${err}`,
                                    });

                                    throw err;
                                }

                                callback(null, posts)

                            });

                    } else {

                        Post.find({
                                site_id: new ObjectId(siteid),
                                title: {
                                    $regex: search, //"^" + search + "$", 
                                    $options: 'i'
                                }
                            })
                            .sort({
                                date_created: -1
                            })
                            .limit(5)
                            .exec(function(err, posts) {

                                if (err) {
                                    logger.log({
                                        level: 'error',
                                        message: 'Mongo - error',
                                        context: __filename,
                                        details: `stderr: ${err}`,
                                    });

                                    throw err;
                                }

                                callback(null, posts)

                            });

                    }

                }
            ],
            function(err, results) {

                return res.send({
                    success: true,
                    data: results[0]
                });

            });

    } else {
        res.sendStatus(401);
    }

}


function getBlockInfo(req, res, next) {

    let siteid = req.params.siteid;
    let postid = req.params.postid;
    let blockid = req.params.blockid;
    let childid = req.params.childid;

    let checkID = new RegExp('^[0-9a-fA-F]{24}$');

    if (
        (siteid && checkID.test(siteid)) &&
        (postid && checkID.test(postid))
    ) {


        Post.findOne({
                _id: new ObjectId(postid),
                site_id: new ObjectId(siteid),
            })
            .populate('blocks.options.gallery.image')
            .populate('blocks.options.custom_filter.category')
            .populate('blocks.blocks.options.custom_filter.category')
            .populate('blocks.options.custom_filter.property')
            .populate('blocks.blocks.options.custom_filter.property')
            .exec(function(err, post) {

                if (err) {
                    logger.log({
                        level: 'error',
                        message: 'Mongo - error',
                        context: __filename,
                        details: `stderr: ${err}`,
                    });

                    throw err;
                }

                if (post && post.blocks && post.blocks.length > 0) {

                    if (!isNaN(blockid)) {

                        let block = [];

                        if (!isNaN(childid)) {

                            // custom filter

                            if (post.blocks[parseInt(blockid)].blocks[parseInt(childid)]) {
                                block = post.blocks[parseInt(blockid)].blocks[parseInt(childid)]
                            }

                        }

                        // custom filter

                        if (post.blocks[parseInt(blockid)]) {
                            block = post.blocks[parseInt(blockid)]
                        }


                        async.series([
                                function(callback) {

                                    if (block.type != 'products') {
                                        callback();
                                    } else {

                                        // we resolve custom filter

                                        if (!(block.options &&
                                                block.options.is_custom_filter &&
                                                block.options.custom_filter &&
                                                block.options.custom_filter.length > 0)) {
                                            callback();
                                        } else {
                                            // we resolve the filter

                                            async function loopCustomFilter() {

                                                for (let i = 0; i < block.options.custom_filter.length; i++) {
                                                    await new Promise(resolve => {

                                                        if (!block.options.custom_filter[i].is_property) {

                                                            Property.find({
                                                                'category': block.options.custom_filter[i].category,
                                                                'site_id': siteid
                                                            }).sort({
                                                                sort: 1
                                                            }).select('name').exec(function(err, properties) {

                                                                if (err) {
                                                                    logger.log({
                                                                        level: 'error',
                                                                        message: 'Mongo - error',
                                                                        context: __filename,
                                                                        details: `stderr: ${err}`,
                                                                    });

                                                                    throw err;
                                                                }

                                                                block.options.custom_filter[i]._doc['properties'] = properties;

                                                                resolve(true);

                                                            });

                                                        } else {
                                                            resolve(true);
                                                        }

                                                    });
                                                }

                                            }

                                            loopCustomFilter().then(function() {
                                                callback();
                                            });


                                        }

                                    }

                                }
                            ],
                            function(err, results) {

                                return res.send({
                                    success: true,
                                    data: block
                                });

                            });





                    } else {
                        return res.send({
                            success: true,
                            data: null
                        });
                    }

                } else {
                    return res.send({
                        success: true,
                        data: null
                    });
                }

            });



    } else {
        res.sendStatus(401);
    }

}