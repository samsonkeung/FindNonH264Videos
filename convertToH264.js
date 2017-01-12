const fs = require("file-system"),
    spawn = require('child_process').spawn;

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
    if (lines.length <= 0){
      process.exit();
    }

    function getDesiredBitrate(line) {
        var splitted = line.split(" "),
            pos = splitted.indexOf("Bitrate:");

        return splitted[pos + 1];
    }

    function getPath(line) {
        var pos = line.indexOf("Video Bitrate"),
            path = line.substring(0, pos - 1);

        return path;
    }

    function getOutputPath(path) {
        var pos = path.lastIndexOf("."),
            extension = path.substring(pos),
            pathNoExtension = path.substring(0, pos),
            outPath = "";

        if (extension === "mp4"){
            outPath = pathNoExtension + "_converted.mp4";
        } else {
            outPath = pathNoExtension + ".mp4";
        }

        return outPath;
    }

    const inPath = getPath(lines[0]),
        bitrate = getDesiredBitrate(lines[0]),
        outPath = getOutputPath(inPath),
        child = spawn("ffmpeg", ["-i", inPath, "-c:v", "h264_omx", "-c:a", "aac", "-b:v", bitrate + "k", outPath]);

    child.stdout.on("data", function (data) {
        process.stdout.write(data);
    });

    child.stderr.on("data", function (data) {
        process.stderr.write(data);
    });

    child.on("close", function (code) {
        process.stdout.write("\n ============================ \n");
        lines.shift();
        autoConvert(lines);
    })


}