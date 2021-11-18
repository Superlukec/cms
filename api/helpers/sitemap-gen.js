const fs = require('fs');
const path = require('path');

const ObjectId = require('mongoose').Types.ObjectId;
const moment = require('moment')

const Post = require('../models/post');
const settings = require('../config/settings');

var destination = path.join(
    __dirname,
    '../../',
    settings.development ?
        ('web/src/sitemap/') :
        ('web/dist/browser/sitemap/')
)

var sitemap_gen = {

    generateSitemap: function (siteId, domain, oldName, newName, sitemapEnabled) {

        return new Promise(function (resolve, reject) {      
            
            if( (oldName && oldName != '' || !sitemapEnabled) ) {

                // if old file
                try {
                    let oldSitemapLocation = destination + oldName;

                    if (fs.existsSync(oldSitemapLocation)) {
                        // file exists - we delete old sitemap
                        fs.unlinkSync(oldSitemapLocation);

                    }

                } catch(err) {
                    console.error(err)
                }

            }

            // if we don't want sitemap
            if(!sitemapEnabled) {
                return resolve(true);
            }

            Post.find({
                site_id: new ObjectId(siteId),
                deleted: false,
                private_page: false,
                type: 'page'
            }).select('title last_change_date date_created slug homepage').sort('date_created homepage').exec(function (err, posts) {

                if(err) {
                    throw err;
                }

                if(posts.length == 0) {
                    return resolve(true);
                }
                else {

                    let xml_content = [
                        '<?xml version="1.0" encoding="UTF-8"?>',
                        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                    ];

                    for(let i = 0; i < posts.length; i++) {

                        let dateChanged = (posts[i].last_change_date) ? posts[i].last_change_date : posts[i].date_created;

                        dateChanged = moment(dateChanged, "x").format('YYYY-MM-DD');

                        let link = (!posts[i].homepage) ? ('/' + posts[i].slug) : '';
                        link = 'http://' + domain + link;

                        let _builder = [
                            '  <url>',
                            '    <loc>' + link + '</loc>',                            
                            '    <lastmod>' + dateChanged + '</lastmod>',
                            '    <priority>' + ((posts[i].homepage) ? '1.0' : '0.8') + '</priority>',
                            '  </url>'
                        ]

                        for(let j = 0; j < _builder.length; j++) {
                            xml_content.push(_builder[j]);
                        }

                        

                    }

                    xml_content.push('</urlset>');

                    //  creata new file
                    let newSitemapLocation = destination + newName;
                    fs.writeFile(newSitemapLocation, xml_content.join('\n'), function(err) {
        
                        if(err) {
                            console.log(err);
                            return resolve(false);
                        }
        
                        return resolve(true);
        
                    });

                }                

            });

        });

    }

}

module.exports = sitemap_gen;