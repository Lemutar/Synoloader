var EXPORTED_SYMBOLS = ['FileDownloaderHandler'];
const { classes: Cc, interfaces: Ci } = Components;

if (typeof FileDownloaderHandler === 'undefined') {
    var FileDownloaderHandler = {};

    Components.utils.import('resource://gre/modules/Downloads.jsm');
    Components.utils.import('resource://gre/modules/Task.jsm');

    (function () {
        this.get_file_content = function (source, destination, succeeded) {
            Task.spawn(function () {
                /*jshint moz: true */
                yield Downloads.fetch(source, destination);
            }).then(succeeded, Components.utils.reportError);
        };
    }).apply(FileDownloaderHandler);
}
