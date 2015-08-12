var EXPORTED_SYMBOLS = ["FileDownloaderHandler"];
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (typeof FileDownloaderHandler === "undefined") {
    var FileDownloaderHandler = {};

    Cu.import("resource://gre/modules/Downloads.jsm", FileDownloaderHandler);
    Cu.import("resource://gre/modules/Task.jsm", FileDownloaderHandler);

    (function () {
        this.get_file_content = function (source, destination, succeeded) {
            Task.spawn(function () {
                yield Downloads.fetch(source, destination);
            }).then(succeeded, Cu.reportError);
        };
    }).apply(FileDownloaderHandler);
}
