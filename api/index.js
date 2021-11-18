#!/usr/bin/env node

const settings = require('./config/settings');

/**
 * Module dependencies.
 */

var app = require('./app');
var debug = require('debug')('intesocms:server');
var http = require('http');


/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || settings.port);
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Websocket
 */
const io = require('socket.io')(server);
var websocket = require('./websocket').init(io);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

/**
 * PM2 watch and restart
 * Code: pm2 start index.js --watch
 */
module.exports = {
  apps: [{
    script: "index.js",
    watch: ["config", "email", "models", "passport", "routes", "app.js"],
    // Delay between restart
    watch_delay: 1000,
    ignore_watch : ["node_modules"],
    watch_options: {
      "followSymlinks": false
    }
  }]
}