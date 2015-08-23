var EXPORTED_SYMBOLS = ["FileDownloaderHandler"];
let { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (typeof FileDownloaderHandler === "undefined") {
    var FileDownloaderHandler = {};

    Cu.import("resource://gre/modules/Downloads.jsm", FileDownloaderHandler);
    Cu.import("resource://gre/modules/Task.jsm", FileDownloaderHandler);

    (function () {
        this.getFileContent = (source, destination, succeeded) => {
            Task.spawn(function () {
                yield Downloads.fetch(source, destination);
            }).then(succeeded, Cu.reportError);
        };
    }).apply(FileDownloaderHandler);
}
