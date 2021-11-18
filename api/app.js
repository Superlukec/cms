var express = require('express');
var handlebars = require('handlebars');
var compression = require('compression');
var helmet = require('helmet');

/**
 * Translation modul
 */
var i18n = require('i18n');
i18n.configure({
    //defaultLocale: 'sl',
    locales: ['sl', 'en'],
    register: global,
    directory: __dirname + '/locales'
});

var path = require('path');
var httplogger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');

const logger = require('./helpers/logging')();

// Database config
var dbConfig = require('./config/db');
const mongoose = require('mongoose');

// Connect to DB
mongoose.connect(dbConfig.url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

// shema for user
require('./models/user');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(cors());
app.use(compression()); // Compress all routes
app.use(helmet()); // protect against well known vulnerabilities

app.use(httplogger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(i18n.init);

app.use(function(req, res, next) {
    handlebars.registerHelper('__', function() {
        var locale = i18n.getLocale()
        req.setLocale(locale);
        res.locals.language = locale;
        //console.log(req.getLocale());
        return i18n.__.apply(req, arguments);
    });
    handlebars.registerHelper('__n', function() {
        var locale = i18n.getLocale()
        req.setLocale(locale);
        res.locals.language = locale;
        return i18n.__n.apply(req, arguments);
    });
    handlebars.registerHelper('istrue', function(value) {
        return value == 'true' || value == true;
    });
    next();
});

//app.use('/profile', express.static('profiles'));
//app.use('/img', express.static('img'));
//app.use('/download', express.static('download'));
app.use('/assets', express.static(path.join(__dirname, '../web/src/assets')));
app.use(express.static(path.join(__dirname, 'app')));


// authenitifations
var passport = require('passport');
app.use(passport.initialize());

// Initialize Passport

var initPassport = require('./passport/init');
initPassport(passport);

app.use('/', require('./routes/auth'));
// app.use('/api/post', require('./routes/post')); --- ne rabimo še
app.use('/api/site', require('./routes/site'));
app.use('/api/management', require('./routes/management'));
app.use('/api/theme', require('./routes/theme'));
app.use('/api/user', require('./routes/user'));
app.use('/api/shareables', require('./routes/shareables'));
app.use('/api/invitation', require('./routes/invitation'));
app.use('/api/logs', require('./routes/logs'));
app.use('/download', require('./routes/download'));
app.use('/api/favicon', require('./routes/favicon'));
app.use('/api/template', require('./routes/template'));

app.use('/install', require('./routes/install'));


//#region we create necessary files

if (!fs.existsSync('tmp')) {
    fs.mkdirSync('tmp');
}

if (!fs.existsSync('shareables')) {
    fs.mkdirSync('shareables');
}

//#endregion


require('./fix-users').then(function(status) {
    if (status) {
        logger.log({
            level: 'info',
            message: 'Fix 1 completed ...',
            context: __filename
        });
    }
});

require('./fix-date-post').then(function(status) {
    if (status) {
        logger.log({
            level: 'info',
            message: 'Fix 2 completed ...',
            context: __filename
        });
    }
});

require('./fix-theme').then(function(status) {
    if (status) {
        logger.log({
            level: 'info',
            message: 'Fix 3 completed ...',
            context: __filename
        });
    }
});

require('./fix-image-size').then(function(status) {
    if (status) {
        logger.log({
            level: 'info',
            message: 'Fix 4 completed ...',
            context: __filename
        });
    }
});

require('./fix-delete-post').then(function(status) {
    if (status) {
        logger.log({
            level: 'info',
            message: 'Fix 5 completed ...',
            context: __filename
        });
    }
});

require('./fix-avatar').then(function(status) {
    if (status) {
        logger.log({
            level: 'info',
            message: 'Fix 6 completed ...',
            context: __filename
        });
    }
});

require('./fix-is-image-explorer').then(function(status) {
    if (status) {
        logger.log({
            level: 'info',
            message: 'Fix 7 completed ...',
            context: __filename
        });
    }
});

var workerPath = '';
if (process.platform === 'win32') {
    workerPath = './api/';
}

// download worker - remove files from download folder (if older then 1 hour)
try {
    const downloadManagerWorker = spawn('node', [workerPath + 'download-worker.js']);
    downloadManagerWorker.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    downloadManagerWorker.stderr.on('data', (data) => {
        logger.log({
            level: 'error',
            message: 'Download manager',
            context: __filename,
            details: `stderr: ${data}`,
        });
    });

    downloadManagerWorker.on('close', (code) => {
        logger.log({
            level: 'warn',
            message: 'Download manager - stopped',
            context: __filename,
            details: `child process exited with code ${code}`,
        });
    });
} catch(e) {
    logger.log({
        level: 'warn',
        message: 'Download manager - stopped',
        context: __filename,
        details: `child process exited with code ${e.stack}`,
    });
}

// setup worker - check if there is new version in update folder
try {
    const setupWorker = spawn('node', [workerPath + 'setup-worker.js']);
    setupWorker.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    setupWorker.stderr.on('data', (data) => {
        logger.log({
            level: 'error',
            message: 'Setup worker - error',
            context: __filename,
            details: `stderr: ${data}`,
        });
    });

    setupWorker.on('close', (code) => {
        logger.log({
            level: 'warn',
            message: 'Setup worker - stopped',
            context: __filename,
            details: `child process exited with code ${code}`,
        });
    });
} catch(e) {
    logger.log({
        level: 'error',
        message: 'Setup worker - error',
        context: __filename,
        details: `stderr: ${e.stack}`,
    });
}

// sitemap generator 
try {
    const sitemapWorker = spawn('node', [workerPath + 'sitemap-worker.js']);
    sitemapWorker.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    sitemapWorker.stderr.on('data', (data) => {
        logger.log({
            level: 'error',
            message: 'Generating sitemap worker - error',
            context: __filename,
            details: `stderr: ${data}`,
        });
    });

    sitemapWorker.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
} catch(e) {
    logger.log({
        level: 'error',
        message: 'Generating sitemap worker - error',
        context: __filename,
        details: `stderr: ${e.stack}`,
    });
}

logger.log({
    level: 'warn',
    message: 'System has restarted',
    context: __filename
});

// if system crash - then we send email
const email = require('./email/email.js');
require('./fix-users');

process.on('uncaughtException', function(err) {

    logger.log({
        level: 'Error',
        message: 'System stopped',
        context: __filename,
        details: err.stack
    });

    email.sendEmail(
        'luka.semolic@gmail.com',
        'CMS system crashed',
        'CMS system crashed. Error: ' + err.stack,
        'message.html', {
            title: 'CMS system crashed',
            text: 'Error: ' + err.stack
        }
    );

    process.exit(1);
});

module.exports = app;