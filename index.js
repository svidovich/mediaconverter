const electron = require('electron');
const dialog = electron.remote.dialog;


let uploadFile = document.getElementById('upload-file');

uploadFile.addEventListener('click', () => {
    // if not macos ( good for you )
    if (process.platform !== 'darwin') {
        // Show a file upload dialog,
        dialog.showOpenDialog({
            title: 'Select File To Convert',
            defaultPath: '~/Desktop',
            buttonLabel: 'Convert',
            properties: ['openFile']
            // Then after we select and upload the file,
        }).then(file => {
            // If usr didn't cancel the upload,
            if (!file.canceled) {
                // For now just write that we didn't cancel.
                document.write("Not canceled.");
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