const fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');

// watch for new files
chokidar.watch(path.join(__dirname, 'updater/*.zip')).on('all', (event, path) => {
    console.log(event, path);
});