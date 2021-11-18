/**
 * Example of Use

{ 
    error: 0, 
    warn: 1, 
    info: 2, 
    verbose: 3, 
    debug: 4, 
    silly: 5 
}

logger.log({
    level: 'warn',
    message: 'System has restarted',
    context: 'app.js',
    // details: [optional]
});

 */

require('./winston-workaround'); // fix for winsoton - clone not found -> when querying for logs

var settings = require('../config/settings');

const {
    createLogger,
    format,
    transports
} = require('winston');
const {
    combine
} = format;

require('winston-daily-rotate-file');

module.exports = function() {
    return createLogger({
        format: combine(
            //format.colorize(),
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.json()
            //format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)           
        ),
        transports: [
            new(transports.Console)({
                level: 'warn',
                format: combine(
                    format.colorize(),
                    format.simple()
                )
            }),
            new(transports.DailyRotateFile)({
                filename: './logs/log',
                datePattern: 'YYYY-MM-DD',
                prepend: true,
                localTime: true,
                json: true,
                level: settings['debug'] ? 'debug' : 'info',
            }),
            new(transports.DailyRotateFile)({
                filename: './logs/log.error',
                datePattern: 'YYYY-MM-DD',
                prepend: true,
                localTime: true,
                json: true,
                level: 'warn',
            })
        ]
    });;
}