const electron = require('electron');
const dialog = electron.remote.dialog;

// Required to convert the media
const ffmpeg = require('ffmpeg');

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
                let fileName = filePath.split('/').slice(-1)[0];
                let fileNameNoExtension = fileName.split('.')[0];
                let postUploadSpan = document.getElementById('after-file-upload');

                // Show the user what file they selected in the UI.
                let conversionTypesDropdown = document.getElementById('conversion-types-dropdown');
                postUploadSpan.innerText = `File selected: ${filePath}
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
                    userNotifyTypeSelected.innerText = "\nType Selected: " + selectedTypeValue;
                    userNotifyTypeSelected.style.visibility = 'visible';
                })
                let convertButtonSpan = document.getElementById('convert-button-span');
                let convertButton = document.getElementById('convert-button');
                convertButtonSpan.style.visibility = 'visible';
                convertButton.addEventListener('click', () => {
                    dialog.showSaveDialog({
                        title: 'Save Converted File',
                        defaultPath: __dirname + "/" + fileNameNoExtension + '.' + selectedTypeValue,
                        buttonLabel: 'Save',
                        properties: [
                            'showOverwriteConfirmation'
                        ]
                    }).then(saveFile => {
                        if (!saveFile.canceled) {
                            saveFilePath = saveFile.filePath.toString();
                            confirmation = document.getElementById('confirmation-span');
                            confirmation.innerText = "Saved converted file to " + saveFilePath + "!";
                            confirmation.style.visibility = 'visible';
                        }
                    })
                })



            }
            // If there was an error, console.log that shit
        }).catch(err => {
            console.log(err);
        })
    } else {
        document.write('Not yet supported. Sorry about your luck. File a github issue.')
    }
})