var EXPORTED_SYMBOLS = ["FileDownloaderHandler"];
let { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Downloads.jsm");
Cu.import("resource://gre/modules/Task.jsm");

if (typeof FileDownloaderHandler === "undefined") {
    var FileDownloaderHandler = {};

    (function () {
        this.getFileContent = (source, destination, succeeded) => {
            Task.spawn(function () {
                yield Downloads.fetch(source, destination);
            }).then(succeeded, Cu.reportError);
        };
    }).apply(FileDownloaderHandler);
}
