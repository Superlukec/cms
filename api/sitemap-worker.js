const path = require('path');
const fs = require('fs');
const async = require('async');
const mongoose = require('mongoose');
const dbConfig = require('./config/db');
const CronJob = require('cron').CronJob;

mongoose.connect(dbConfig.url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

const logger = require('./helpers/logging')();

const sitemapGenerator = require('./helpers/sitemap-gen');
const Site = require('./models/site');

var job = new CronJob('00 00 18 * * *', function () {

    console.log('tick')
    
    Site.find({
        active: true,
        public: true,
        sitemap_enabled: true
    })
    .exec(function (err, sites) {

        if(err) {
            throw err;
        }

        if (sites.length > 0) {

            async.eachSeries(sites, function (site, callback) {

                sitemapGenerator.generateSitemap(
                    site._id,
                    site.domain,
                    '',
                    site.sitemap_name,
                    site.sitemap_enabled
                ).then((data) => {

                    callback();

                });

            }, function () {                    
                
            });

        }        

    });

}, null, true, 'Europe/Berlin');
job.start();