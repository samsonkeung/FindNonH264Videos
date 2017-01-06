const fs = require("file-system"),
    exec = require('child_process').exec;

extractFileList();

function extractFileList(){
    var targetDir = process.argv[2];

    if (!targetDir) {
        console.error("Usage: nodejs extractNonH264 <path>");
        process.exit();
    }

    function appendSlash(path){
        if (path.charAt(path.length - 1) != "/"){
            return path + "/";
        } else {
            return path;
        }
    }

    fs.readdir(targetDir, function(err, files) {
        if (err) {
            throw("Cannot read target directory: " + err);
        } else {
            inspectFiles(appendSlash(targetDir), files);
        }
    });
}

function parseOutput(output, filePath){
    var lines = output.split("\n");

    for (var i = 0; i < lines.length; i++){
        if (lines[i].indexOf("Stream #0:0: Video:") >= 0 || lines[i].indexOf("Stream #0:1: Video:") >= 0){
            if (lines[i].indexOf("h264") < 0){
                process.stdout.write(filePath + " \n");
            }
        }
    }
}

function inspectFiles(targetDir, files){
    var total = 0,
        count = 0;

    function inspect(path){
        exec("ffprobe " + "'" + path + "'", function(err, stdout, stderr) {
            count++;

            if (err) {
                throw("Cannot run ffprobe command on " + path + " : " + err);
            } else {
                parseOutput(stderr.toString(), path);
                if (count === total) {process.exit();}
            }
        });
    }

    for (var i = 0; i < files.length; i++){
        var fileName = files[i],
            path = targetDir + fileName;

        if (fs.statSync(path).isFile()){
            // console.log(path);
            total++;
            inspect(path);
        }

    }
}