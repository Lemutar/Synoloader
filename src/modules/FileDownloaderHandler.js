var EXPORTED_SYMBOLS = ["FileDownloaderHandler"];

Components.utils.import("resource://gre/modules/Downloads.jsm");
Components.utils.import("resource://gre/modules/Task.jsm");

if (typeof FileDownloaderHandler === "undefined") {
    var FileDownloaderHandler = {};

    (function() {
        this.getFileContent = (source, destination, succeeded) => {
            Task.spawn(function*() {
                yield Downloads.fetch(source, destination);
            }).then(succeeded, Components.utils.reportError);
        };
    }).apply(FileDownloaderHandler);
}
