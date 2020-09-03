const electron = require('electron');
const dialog = electron.remote.dialog;
const path = require('path');

// Required to convert the media
const ffmpeg = require('js-ffmpeg');
const fs = require('fs');
const os = require('os')

let filePath = undefined;
let dropArea = document.getElementById('drop-area');

// Add stylistic changes for when the user drags a file into the interface.
function highlight(e) {
    dropArea.classList.add('highlight');
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});


function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

// Set the drop handler to be the handleDrop function.
dropArea.addEventListener('drop', handleDrop, false);

let postUploadSpan = document.getElementById('after-file-upload');

// This initializes the type to which the user wishes to convert their file. The value is subject
// to change if the user adjusts their desired file type.
let selectedTypeValue = document.getElementById('conversion-types-dropdown').value;
document.getElementById('conversion-types-dropdown').addEventListener('change', selectedTypeEvent => {
    selectedTypeValue = document.getElementById('conversion-types-dropdown').value;
});


// This is a "progress" section to keep the user occupied while conversion takes place.
let progressSection = document.getElementById('progress-kind-of');

// This span will have text added to let the user know whether conversion was successful or not.
let confirmation = document.getElementById('confirmation-span');

// Function that does the actual conversion. Runs ffmpeg and saves the file to the new destination.
// This doesn't have to be async, but we'll allow it.
async function doConvert(inputFilePath, outputFilePath) {
    postUploadSpan.innerText = `File selected: ${inputFilePath}!`;
    postUploadSpan.style.visibility = 'visible';
    return new Promise((resolve, reject) => {
        fs.mkdtemp(path.join(os.tmpdir(), 'mediaconvertertmp-'), (error, directory) => {
            // We need to copy the file temporarily just in case it has spaces in the name.
            // When js-ffmpeg calls the ffmpeg binary via docker-polyfill, it splits the arguments
            // on spaces; you _cannot_ run it on a file with spaces in the name directly.
            const temporaryInputFilePath = path.join(directory, 'tmpfilein');
            const temporaryOutputFilePath = path.join(directory, 'tmpfileout');
            fs.copyFileSync(inputFilePath, temporaryInputFilePath)
            ffmpeg.ffmpeg(temporaryInputFilePath, ["-f", selectedTypeValue], temporaryOutputFilePath, progress => {
                console.log(progress);
                progressSection.innerText = progress.time;
            }).success(() => {
                fs.copyFileSync(temporaryOutputFilePath, outputFilePath);
                confirmation.innerText = "Saved converted file to " + outputFilePath + "!";
                progressSection.innerText = "";
                resolve(true);
            }
            ).error(error => {
                confirmation.innerText = "Failed to convert file: " + error.message;
                console.log(error.stack);
                progressSection.innerText = "";
                resolve(false);
            })
        })
    })
}

function handleFiles(files) {
    let file = files[0];
    let filePath = file.path;
    let fileName = file.name;
    let fileNameNoExtension = fileName.split('.')[0];
    let fileDirectory = path.dirname(filePath);
    let defaultSavePath = fileDirectory + "/" + fileNameNoExtension + '.' + selectedTypeValue;

    // Determine whether the user wants to save to the same directory as the original file based on
    // whether the box is checked.
    let useDirectoryOfInputFile = document.getElementById('retain-original-directory').checked;

    if (useDirectoryOfInputFile) {
        doConvert(filePath, defaultSavePath);
    } else {
        dialog.showSaveDialog({
            title: 'Save Converted File',
            defaultPath: defaultSavePath,
            buttonLabel: 'Save',
            properties: [
                'showOverwriteConfirmation'
            ]
        }).then(saveFile => {
            if (!saveFile.canceled) {
                // Get information about the output filename and show user.
                saveFilePath = saveFile.filePath.toString();
                saveFileDirectory = path.dirname(saveFilePath);
                saveFileName = path.basename(saveFilePath);

                // Run ffmpeg. Do _not_ infer the output type from the save data. Use the info
                // from the dropdown selection.
                doConvert(filePath, saveFilePath);
            }
        });
    }


}

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
}