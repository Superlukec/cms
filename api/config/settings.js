let debug = true;
let development = false;
let send_live_email = true;
let multisite = true;
let port = process.env.PORT;

module.exports = {
    'port': port,
    'debug': debug,
    'development': development,
    'secret': process.env.SECRET,
    'send-live-email': send_live_email,
    'multisite': multisite
}