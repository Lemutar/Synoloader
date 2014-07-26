var EXPORTED_SYMBOLS = ["FileDownloaderHandler"];




if (typeof FileDownloaderHandler == "undefined") {
    var FileDownloaderHandler = {};


    Components.utils.import("resource://gre/modules/Downloads.jsm");
    Components.utils.import("resource://gre/modules/Task.jsm");

    (function() {


        this.get_file_content = function(source, destination, succeded) {
            Task.spawn(function() {
                /*jshint moz: true */
                yield Downloads.fetch(source, destination);
            }).then(succeded, Components.utils.reportError);
        };

    }).apply(FileDownloaderHandler);


}
