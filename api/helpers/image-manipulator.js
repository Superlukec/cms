const async = require('async');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const logger = require('../helpers/logging')();

var imageSizes = [];

function manipulatorAddImageSize(name, width, height = null, algorithm = 'center') {

    let sharpAlgorithm = sharp.fit.centre;
    if (algorithm == 'cover') {
        sharpAlgorithm = sharp.fit.cover;
    } else if (algorithm == 'inside') {
        sharpAlgorithm = sharp.fit.inside;
    } else if (algorithm == 'contain') {
        sharpAlgorithm = sharp.fit.contain;
    }

    imageSizes.push({
        name: name,
        width: width,
        height: (height) ? height : null,
        algorithm: sharpAlgorithm
    });
}

function manipulatorDifferentSizeGenerator(imagePath, destination, destinationFileName) {

    return new Promise((res, rej) => {

        logger.log({
            level: 'info',
            message: 'Different image size generator started',
            context: __filename,
            details: 'Filename: ' + destinationFileName
        });

        var fileNames = [];

        async.eachSeries(imageSizes, function(size, callback) {


            try {
                if (fs.existsSync(imagePath)) {

                    let image = sharp(imagePath);

                    let sharpAlgorithm = sharp.fit.centre;
                    if (size.algorithm == 'cover') {
                        sharpAlgorithm = sharp.fit.cover;
                    } else if (size.algorithm == 'inside') {
                        sharpAlgorithm = sharp.fit.inside;
                    } else if (size.algorithm == 'contain') {
                        sharpAlgorithm = sharp.fit.contain;
                    }

                    image.metadata()
                        .then(function(metadata) {

                            let dimension = {
                                width: size.width,
                                fit: sharpAlgorithm,
                                position: 'center',
                                background: { r: 255, g: 255, b: 255, alpha: 1 },
                                withoutEnlargement: false
                            }

                            if (size.height) {
                                dimension['height'] = size.height;
                            }

                            let extensionname = path.extname(destinationFileName);
                            let basename = path.basename(destinationFileName, extensionname) + '_' + size.name;
                            let filename = basename + extensionname;

                            fileNames.push({
                                name: size.name,
                                filename: filename
                            });

                            return image
                                .resize(dimension)
                                .toFile(path.join(destination, filename));

                        })
                        .then(function(data) {
                            callback(null);
                        })
                        .catch(function(err) {
                            logger.log({
                                level: 'error',
                                message: 'Different image size generator started',
                                context: __filename,
                                details: 'Err: ' + err
                            });

                            callback(err);
                        });


                } else {
                    logger.log({
                        level: 'info',
                        message: 'Image doesn\'t exist',
                        context: __filename,
                        details: 'Filename: ' + destinationFileName
                    });

                    callback('Image doesn\'t exist');
                }
            } catch (err) {
                callback(err);
            }


        }, function(err) {

            // we remove all image sizes
            while (imageSizes.length != 0) {
                imageSizes.pop();
            }

            if (!err) {

                res(fileNames);
            } else {

                rej(err);
            }

        });

    });

}


module.exports = {
    manipulatorAddImageSize,
    manipulatorDifferentSizeGenerator
};