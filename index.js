const electron = require('electron');
const dialog = electron.remote.dialog;
const path = require('path');

// Required to convert the media
const ffmpeg = require('js-ffmpeg');
const fs = require('fs');
const os = require('os')

let uploadFile = document.getElementById('upload-file');
let filePath = undefined;
let dropArea = document.getElementById('drop-area');
console.log(dropArea);

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

function handleFiles(files) {
    let file = files[0];
    let filePath = file.path;
    let fileName = file.name;
    let fileNameNoExtension = fileName.split('.')[0];

    dialog.showSaveDialog({
        title: 'Save Converted File',
        defaultPath: __dirname + "/" + fileNameNoExtension + '.' + selectedTypeValue,
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


['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});


dropArea.addEventListener('drop', handleDrop, false);


let postUploadSpan = document.getElementById('after-file-upload');

// Add event listener for output file type selection dropbox
let conversionTypesDropdown = document.getElementById('conversion-types-dropdown');
let selectedTypeValue = document.getElementById('conversion-types-dropdown').value;
document.getElementById('conversion-types-dropdown').addEventListener('change', selectedTypeEvent => {
    selectedTypeValue = document.getElementById('conversion-types-dropdown').value;
});

let confirmation = document.getElementById('confirmation-span');
let progressSection = document.getElementById('progress-kind-of');

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

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
}