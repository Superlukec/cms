var fs = require('fs');
var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var settings = require('../config/settings');

const logger = require('../helpers/logging')();

var exports = module.exports = {};

var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
    
});

var readHTMLFile = function(path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function(err, html) {
        if (err) {
            callback(err);

            logger.log({
                level: 'error',
                message: 'Error opening email template',
                context: __filename,
                details: `Err: ${err}`,
            });

            throw err;
        } else {
            callback(null, html);
        }
    });
};

exports.sendEmail = function(recipient, subject, text_body, html_file, replacements, attachments, callback) {

    if (settings['send-live-email']) {

        readHTMLFile(__dirname + '/templates/' + html_file, function(err, html) {

            var template = handlebars.compile(html);
            var htmlToSend = template(replacements);

            let mailOptions = {
                from: '"CMS sender" <sender@email.com>', // sender address          
                subject: subject, // Subject line
                text: text_body, // plain text body
                html: htmlToSend // html body
            };

            if (recipient.length > 0) {
                mailOptions['bcc'] = recipient;
            } else {
                mailOptions['to'] = recipient;
            }

            /**
             * We check for the attachments
             */
            if (attachments && attachments.length > 0) {
                mailOptions['attachments'] = attachments;
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {

                    logger.log({
                        level: 'error',
                        message: 'E-mail not sent successfully',
                        context: 'email.js',
                        details: `Err: ${error}`,
                    });

                    if (callback) {
                        callback(true, error);
                    }
                } else {

                    logger.log({
                        level: 'debug',
                        message: 'E-mail sent successfully',
                        context: 'email.js',
                        details: info
                    });

                    if (callback) {
                        callback(false);
                    }
                }
            });

        });
    } else {

        logger.log({
            level: 'debug',
            message: 'Send e-mail skipped',
            context: 'email.js',
            details: 'Skipped because send-live-email = false'
        });

        if (callback) {
            callback(false);
        }

    }


};