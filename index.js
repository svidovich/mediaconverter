const electron = require('electron');
const dialog = electron.remote.dialog;
const path = require('path');

// Required to convert the media
const ffmpeg = require('js-ffmpeg');
const fs = require('fs');
const os = require('os')

let uploadFile = document.getElementById('upload-file');
let filePath = undefined;

uploadFile.addEventListener('click', () => {
    // if not macos ( good for you )
    if (process.platform !== 'darwin') {
        // Show a file upload dialog,
        dialog.showOpenDialog({
            title: 'Select File To Convert',
            defaultPath: __dirname,
            buttonLabel: 'Open',
            properties: ['openFile']
            // Then after we select and upload the file,
        }).then(file => {
            // If usr didn't cancel the upload,
            if (!file.canceled) {
                // Get the filepath, and split it a couple of different ways
                // in case we need the pieces.
                filePath = file.filePaths[0].toString();
                let fileName = path.basename(filePath);

                let fileNameNoExtension = fileName.split('.')[0];
                let postUploadSpan = document.getElementById('after-file-upload');

                // Show the user what file they selected in the UI.
                let conversionTypesDropdown = document.getElementById('conversion-types-dropdown');
                postUploadSpan.innerText = `File selected: ${filePath}!

                Select output type:`;

                // Make output type selection visible. Add a listener, and wait for change.
                // If it changes, get the selected type desired.
                postUploadSpan.style.visibility = 'visible';
                conversionTypesDropdown.style.visibility = 'visible';
                // Set this so that it is defined whether user chooses a new value or not.
                let selectedTypeValue = document.getElementById('conversion-types-dropdown').value;
                document.getElementById('conversion-types-dropdown').addEventListener('change', selectedTypeEvent => {
                    selectedTypeValue = document.getElementById('conversion-types-dropdown').value;
                    userNotifyTypeSelected = document.getElementById('after-type-selected');
                    // Show user the type that's currently selected. This is probably just junk.
                    userNotifyTypeSelected.innerText = "\nType Selected: " + selectedTypeValue;
                    userNotifyTypeSelected.style.visibility = 'visible';
                })

                // Show the convert button.
                let convertButtonSpan = document.getElementById('convert-button-span');
                let convertButton = document.getElementById('convert-button');
                convertButtonSpan.style.visibility = 'visible';

                // Wait for usr to click the convert button. When they do,
                // show the save file dialog.
                // Use onclick instead of adding an event listener to prevent goofy bugs.

                convertButton.onclick = () => {
                    dialog.showSaveDialog({
                        title: 'Save Converted File',
                        defaultPath: __dirname + "/" + fileNameNoExtension + '.' + selectedTypeValue,
                        buttonLabel: 'Save',
                        properties: [
                            'showOverwriteConfirmation'
                        ]
                    }).then(saveFile => {
                        convertButton.removeEventListener('click', () => { });
                        if (!saveFile.canceled) {
                            // Get information about the output filename and show user.
                            saveFilePath = saveFile.filePath.toString();
                            saveFileDirectory = path.dirname(saveFilePath);
                            saveFileName = path.basename(saveFilePath);
                            // Pad the save file name for use with ffmpeg
                            saveFileNamePadded = `"${saveFileName}"`;
                            paddedSaveFilePath = saveFileDirectory + "/" + saveFileNamePadded;

                            confirmation = document.getElementById('confirmation-span');
                            confirmation.style.visibility = 'visible';

                            // Run ffmpeg. Do _not_ infer the output type from the save data. Use the info
                            // from the dropdown selection.
                            doConvert(filePath, saveFilePath, selectedTypeValue).then(successfulConversion => {
                                if (successfulConversion === true) {
                                    confirmation.innerText = "Saved converted file to " + saveFilePath + "!";
                                } else {
                                    confirmation.innerText = "Failed to convert file! Try again... " + successfulConversion;
                                }
                            });


                        }
                    })
                }
            }
            // If there was an error, console.log that shit
        }).catch(err => {
            console.log(err);
        })
    } else {
        document.write('Mac not yet supported. Sorry about your luck. File a github issue.')
    }
})

async function doConvert(inputFilePath, outputFilePath, outputType) {
    return new Promise((resolve, reject) => {
        fs.mkdtemp(path.join(os.tmpdir(), 'mediaconvertertmp-'), (error, directory) => {
            // We need to copy the file temporarily just in case it has spaces in the name.
            // When js-ffmpeg calls the ffmpeg binary via docker-polyfill, it splits the arguments
            // on spaces; you _cannot_ run it on a file with spaces in the name directly.
            const temporaryInputFilePath = path.join(directory, 'tmpfilein');
            const temporaryOutputFilePath = path.join(directory, 'tmpfileout');
            fs.copyFileSync(inputFilePath, temporaryInputFilePath)
            ffmpeg.ffmpeg(temporaryInputFilePath, ["-f", outputType], temporaryOutputFilePath, progress => {
                console.log(progress);
            }).success(() => {
                fs.copyFileSync(temporaryOutputFilePath, outputFilePath)
                resolve(true);
            }
            ).error(error => {
                resolve(false);
            })
        })
    })
}