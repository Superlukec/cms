const settings = require('./config/settings');

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const chalk = require("chalk");
const archiver = require("archiver");
const { crc32 } = require("crc");
const extract = require('extract-zip');
const semver = require('semver')
const spawn = require("child_process").spawn;


var zipFileName;
var version;
var workingDirectory;

// we check the file

let findFile = new Promise(function (response, reject) {

    let jsonfile = fs.readFileSync('package.json');
    let packageJson = JSON.parse(jsonfile);
    version = "N/A";

    if (packageJson && packageJson.version) {
        version = packageJson.version;
    }

    console.log(`${chalk.blue("Current version: " + version)}`);
    console.log(`${chalk.white("Looking for instalation ...")}`);
    let firstFile = false;
    let filesAvailable = 0;

    // we read .zip from updater folder
    // we take only first zip file!
    fs.readdirSync(path.join(__dirname, '/updater')).forEach(file => {

        let extname = path.extname(file);

        if (extname == '.zip') {

            filesAvailable++;

            if (!firstFile) {

                firstFile = true;

                zipFileName = file;

                console.log(`${chalk.green("Found instalation " + file)}`);

                //#region we check CRC
                console.log(`${chalk.white("Checking CRC ...")}`);

                let basename = path.basename(file, '.zip');
                let splitter = basename.split('__');

                let fileCRC;

                if (splitter[1]) {
                    fileCRC = (splitter[1]);
                }
                else {
                    console.log(`${chalk.red("Incorrect file")}`);
                    return response(false);
                }

                let crc = crc32(fs.readFileSync(path.join(__dirname, '/updater/' + file), "utf8")).toString(
                    16
                );

                if (fileCRC == crc) {
                    console.log(`${chalk.green("CRC is correct")}`);
                }
                else {
                    console.log(`${chalk.red("CRC is incorrect")}`);
                    return response(false);
                }
                //#endregion

                //#region version
                let fileVersion = 'N/A';
                if (splitter[0]) {
                    fileVersion = semver.coerce(splitter[0].replace(/\_/g, "."));
                }

                let difVersion = semver.diff(version, fileVersion);

                console.log(`${chalk.yellow("Update version: " + fileVersion + ' (' + difVersion + ')')}`);

                if (difVersion == 'minor') {
                    console.log(`${chalk.red("Quiting... Update version is older.")}`);
                    //return response(false);
                }
                else if (!difVersion) {
                    console.log(`${chalk.red("Quiting... Versions are the same.")}`);
                    //return response(false);
                }
                //#endregion

                //#region prompt the user
                let decision;

                async function waitForUserInput() {

                    for (let i = 0; i < 99; i++) {

                        await new Promise(function (res, rej) {

                            rl.question("Would you like to continue (Y/n)?", function (val) {

                                if (val == 'Y' || val == 'y' || val == 'n') {
                                    if (val == 'Y' || val == 'y') {
                                        decision = true;
                                        res();
                                    }
                                    else if (val == 'n') {
                                        decision = false;
                                        res();
                                    }
                                    i = 99;
                                }
                                else {
                                    res();
                                }

                            });

                        })
                    }

                }

                waitForUserInput().then(function (result) {

                    if (decision != null) {

                        rl.close();

                        if (decision == true) {
                            console.log(`${chalk.green("Continue ...")}`);

                            return response(true);

                        }
                        else if (decision == false) {

                            console.log(`${chalk.yellow("Canceled")}`);

                            return response(false);
                        }



                    }

                });
                //#endregion


            }
        }
    });

    // if no files
    if (filesAvailable == 0) {
        console.log(`${chalk.yellow("No files found ...")}`);
        return response(false);
    }
});

findFile.then(async function (result) {

    if (result) {
        // continue the process

        //#region backup
        console.log(`${chalk.white("Creating backup folder ...")}`);

        workingDirectory = 'bckup.' + version;

        await fs.promises.mkdir(path.join(__dirname, '../' + workingDirectory), { recursive: true })

        console.log(`${chalk.white("Creating a backup ...")}`);

        // create a backup of api folder
        let copyApi = new Promise(function (resolve, reject) {

            // we don't copy shareables and download folder - can be big
            let ignoreFolder = /^.*(shareables|download).*$/;           // FUTURE NOTE - adjust regex for reading / or \ to see if it's folder 

            fs.copy(path.join(__dirname, '../api'), path.join(__dirname, '../' + workingDirectory + '/api'), {
                filter: (src, dest) => {

                    // we ignore some folders (NOT FILES!)

                    if (fs.existsSync(src)) {

                        if (fs.lstatSync(src).isDirectory()) {
                            if (ignoreFolder.test(src)) {
                                return false;
                            }
                        }

                    }

                    return true;

                }
            })
                .then(() => {
                    console.log(`${chalk.green("Backedup API folder")}`);
                    resolve();
                })
                .catch(err => {
                    return console.error(err)
                })

        });

        // create a backup of web folder
        copyApi.then(function () {

            fs.copy(path.join(__dirname, '../web'), path.join(__dirname, '../' + workingDirectory + '/web'))
                .then(async function () {

                    console.log(`${chalk.green("Backedup WEB folder")}`);

                    console.log(`${chalk.white("Trying to extrac a ZIP file ...")}`);

                    // we unpack and put in folder
                    try {
                        let filePath = path.join(__dirname, '/updater/' + zipFileName);

                        console.log(`${chalk.green("Extracted ZIP file")}`);
                        await extract(filePath, { dir: path.join(__dirname, '../' + workingDirectory + '/update') })

                        console.log(`${chalk.white("Copying new files ...")}`);

                        fs.copy(path.join(__dirname, '../' + workingDirectory + '/update/api'), path.join(__dirname, '../api'))
                            .then(() => {

                                console.log(`${chalk.green("API folder copied")}`);

                                fs.copy(path.join(__dirname, '../' + workingDirectory + '/update/web'), path.join(__dirname, '../web'))
                                    .then(() => {

                                        console.log(`${chalk.green("WEB folder copied")}`);

                                        let path_workingDirectory = path.join(__dirname, '../' + workingDirectory);
                                        let settings_jsonLocation = path.join(path_workingDirectory, '/web/dist/browser/assets/settings.json');

                                        // settings.json from asset
                                        console.log(`${chalk.green("Integrating settings.json")}`);

                                        let settingsJSON = new Promise(function (response, reject) {

                                            if (fs.existsSync(settings_jsonLocation)) {
                                                fs.copy(settings_jsonLocation, path.join(__dirname, '../web/dist/browser/assets/settings.json'))
                                                    .then(() => {
                                                        console.log(`${chalk.green("settings.json [changed]")}`);
                                                        response();
                                                    })
                                                    .catch(err => {
                                                        console.log(err);
                                                        console.log(`${chalk.yellow("settings.json [not changed]")}`);
                                                        response();
                                                    })

                                            }
                                            else {
                                                console.log('File not found');
                                                console.log(`${chalk.yellow("settings.json [not changed]")}`);
                                                response();
                                            }

                                        });


                                        settingsJSON.then(function (result) {

                                            //#region create zip

                                            let createZip = new Promise(function (response, reject) {

                                                let fileName = workingDirectory;
                                                let zipName = fileName + ".zip";
                                                var output = fs.createWriteStream(
                                                    path.join(__dirname, '../' + zipName)
                                                );

                                                var archive = archiver("zip", {
                                                    zlib: { level: 9 } // Sets the compression level.
                                                });

                                                archive.directory(path.join(__dirname, '../' + workingDirectory), false);

                                                archive.pipe(output);
                                                archive.finalize();

                                                output.on("close", function () {
                                                    console.log(`${chalk.green("ZIP created")}`);

                                                    console.log(archive.pointer() + " total bytes");
                                                    console.log(
                                                        "archiver has been finalized and the output file descriptor has closed."
                                                    );

                                                    response();
                                                });
                                                archive.on("warning", function (err) {
                                                    if (err.code === "ENOENT") {
                                                        // Log warning
                                                    } else {
                                                        // Throw error
                                                        console.log(`${chalk.red(err)}`);
                                                    }

                                                    response();
                                                });

                                                archive.on("error", function (err) {
                                                    console.log(err.toString());

                                                    response();
                                                });

                                            });

                                            //#endregion

                                            createZip.then(function (result) {

                                                //#region PORT number server

                                                console.log(`${chalk.green("Adjusting port number: " + settings.port)}`);

                                                // we adjust the right port number
                                                let settingsFileLocation = path.join(__dirname, '/config/settings.js');
                                                let settingsFile = fs.readFileSync(settingsFileLocation, 'utf8');     
                                                let portNumberString = "let port = " + ((settings.port) ? settings.port : 1339);                                                
                                                let ouput = settingsFile.replace("let port = 1339", portNumberString);
                                                fs.writeFileSync(settingsFileLocation, ouput);                                                

                                                //#endregion

                                                // npm install
                                                var cmd = "npm";
                                                if (process.platform === "win32") {
                                                    cmd = "npm.cmd";
                                                }

                                                var install = spawn(cmd, ["install"], {
                                                    cwd: path.join(__dirname, '../api')
                                                });

                                                install.stdout.on("data", function (data) {
                                                    console.log(data.toString());
                                                });

                                                install.stderr.on("data", function (data) {
                                                    console.log(`${chalk.yellow(data.toString())}`);
                                                });

                                                // On process finish
                                                install.on("exit", function (code) {

                                                    if (code.toString() != "0") {
                                                        console.log(`${chalk.red("Problems with npm install")}`);
                                                        console.log(`${chalk.red(code.toString())}`);

                                                        process.exit()
                                                    }


                                                    // restart pm2 
                                                    var cmd = "pm2";
                                                    if (process.platform === "win32") {
                                                        cmd = "pm2.cmd";
                                                    }

                                                    var restart = spawn(cmd, ["reload", "all"]);

                                                    restart.stdout.on("data", function (data) {
                                                        console.log(data.toString());
                                                    });

                                                    restart.stderr.on("data", function (data) {
                                                        console.log(`${chalk.yellow(data.toString())}`);
                                                    });

                                                    // On process finish
                                                    restart.on("exit", function (code) {

                                                        if (code.toString() != "0") {
                                                            console.log(`${chalk.red("Problems with reloading pm2")}`);
                                                            console.log(`${chalk.red(code.toString())}`);

                                                            process.exit()
                                                        }

                                                        console.log(`${chalk.white("Cleaning the backup files ...")}`);

                                                        console.log(`${chalk.green("Done ...")}`);

                                                        process.exit();

                                                        // @todo testirat
                                                        //rimraf.sync(path.join(__dirname, '../tmp.backup'));                                    

                                                    });

                                                });


                                            });



                                        });


                                    })
                                    .catch(err => {
                                        return console.error(err)
                                    })

                            })
                            .catch(err => {
                                return console.error(err)
                            })

                    } catch (err) {

                        console.log(`${chalk.red("Error extracting the ZIP file")}`);
                        console.log(`${chalk.red(err.toString())}`);

                    }

                })
                .catch(err => {
                    return console.error(err)
                })

        });
        //#endregion 

    }
    else {
        process.exit()
    }

});

