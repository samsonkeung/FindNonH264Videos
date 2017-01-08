const fs = require("file-system"),
    exec = require('child_process').exec;

main();

function main(){
    var path = process.argv[2];

    if (!path || process.argv.length > 3) {
        console.error("Usage: nodejs convertToH264 <path>");
        process.exit();
    }

    fs.readFile(path, function(err, data){
        if (err){
            console.log("Cannot read file at: " + path);
            process.exit();
        }

        autoConvert(data.toString().split("\n"));
    });
}

function autoConvert(lines) {
    //console.log(lines[0]);
    function getDesiredBitrate(line) {
        var splitted = line.split(" "),
            pos = splitted.indexOf("Bitrate:");

        return (parseInt(splitted[pos + 1]) - 100).toString();
    }

    function getPath(line) {
        var pos = line.indexOf("Video Bitrate"),
            path = line.substring(0, pos - 1);

        return path;
    }

    console.log(getPath(lines[0]));
    console.log(getDesiredBitrate(lines[0]));
}