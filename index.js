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
            buttonLabel: 'Convert',
            properties: ['openFile']
            // Then after we select and upload the file,
        }).then(file => {
            // If usr didn't cancel the upload,
            if (!file.canceled) {
                // For now just write that we didn't cancel.
                filePath = file.filePaths[0].toString();
                let postUploadSpan = document.getElementById('after-file-upload');
                let conversionTypesDropdown = document.getElementById('conversion-types-dropdown');
                postUploadSpan.innerText = `File selected: ${filePath}
                Select output type:`;
                postUploadSpan.style.visibility = 'visible';
                conversionTypesDropdown.style.visibility = 'visible';
                document.getElementById('conversion-types-dropdown').addEventListener('change', selectedTypeEvent => {
                    selectedTypeValue = document.getElementById('conversion-types-dropdown').value;
                    userNotifyTypeSelected = document.getElementById('after-type-selected');
                    userNotifyTypeSelected.innerText = "\nType Selected: " + selectedTypeValue;
                    userNotifyTypeSelected.style.visibility = 'visible';
                })
            } else {
                // Otherwise, write that we canceled.
                document.write("Canceled.");
            }
            // If there was an error, console.log that shit
        }).catch(err => {
            console.log(err);
        })
    }
})