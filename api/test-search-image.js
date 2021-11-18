var dbConfig = require('./config/db');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

// Connect to DB
mongoose.connect(dbConfig.url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});


const Site = require('./models/site');
const Theme = require('./models/theme');
const Post = require('./models/post');
const Product = require('./models/product');


// favicon 
Site.find({
    'favicon': { "$regex": "027ea1d6eb600cd1279869a39988fec8", "$options": "i" } 
})
.exec(function (err, site) {

    if(err) {
        throw err;
    }

    console.log(site.length);


});


// iskanje logotipa (header | footer)
Theme.find({
    $or: [ 
        {
            'configuration.layout.header': { "$regex": "7b1876ef8ee771af76f0aaf1f9764bc3", "$options": "i" }     
        },
        {
            'configuration.layout.footer': { "$regex": "7b1876ef8ee771af76f0aaf1f9764bc3", "$options": "i" }     
        }
    ]
})
.exec(function (err, theme) {

    if(err) {
        throw err;
    }

    console.log(theme.length);


});


// iskanje slike v postu
Post.find({
    $or: [
        {
            'featured_image': new Object('5ea93b6596f1b125148116c5')  
        },
        {
            'blocks.value': { "$regex": "0c5df588f8340770983bb82635a51e22", "$options": "i" } 
        },
        {
            'blocks.options.gallery.image': new Object('5ea93b6596f1b125148116c5')
        }
    ]
})
.exec(function (err, post) {

    if(err) {
        throw err;
    }

    console.log(post.length);


});


// iskanje slike v produktu
Product.find({
    $or: [
        {
            'image.file': new Object('5ea93b6596f1b125148116c5')  
        },
        {
            'attachment.file': new Object('5ea93b6596f1b125148116c5')
        }
    ]
})
.exec(function (err, post) {

    if(err) {
        throw err;
    }

    console.log(post.length);


});
