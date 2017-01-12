const fs = require("file-system"),
    exec = require('child_process').exec;

main();

function main(){
    var targetDir = process.argv[2];

    if (!targetDir || process.argv.length > 3) {
        console.error("Usage: nodejs extractNonH264 <path>");
        process.exit();
    }

    extractFileList(targetDir)
}

function extractFileList(targetDir){
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
    var lines = output.split("\n"),
        codec = "",
        vbitrate = 0,
        abitrate = 0,
        tbitrate = 0;

    for (var i = 0; i < lines.length; i++){
        var splitted = lines[i].split(" "),
            pos = -1;

        if (splitted.indexOf("Duration:") >= 0) {
            pos = splitted.indexOf("bitrate:");

            if (pos >= 0){
                tbitrate = parseInt(splitted[pos + 1]);
            }
        }

        if (splitted.indexOf("Stream")){
            pos = splitted.indexOf("Video:");
            if (pos >= 0){
                codec = splitted[pos + 1];

                pos = splitted.indexOf("kb/s");
                if(pos >= 0){
                    vbitrate = parseInt(splitted[pos - 1]);
                }
            }

            pos = splitted.indexOf("Audio:");
            if (pos >= 0){
                pos = splitted.indexOf("kb/s");
                if(pos >= 0){
                    abitrate = parseInt(splitted[pos - 1]);
                }
            }
        }
    }

    if (codec != "h264"){
        var vbitrate_s = vbitrate? vbitrate.toString() : (tbitrate - abitrate).toString();
        process.stdout.write(filePath + " Video Bitrate: " + vbitrate_s + "\n");
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

        if (fileName.charAt(0) != "." && fs.statSync(path).isFile()){
            // console.log(path);
            total++;
            inspect(path);
        }

    }
}