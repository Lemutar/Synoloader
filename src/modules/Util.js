var EXPORTED_SYMBOLS = ["Util"];
const { classes: Cc, interfaces: Ci } = Components;

if (typeof Util == "undefined") {
    var Util = {};

    (function() {
        this.show_log = true;
        this.consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);

        this.log = function(errmsg) {
            if (this.show_log === true) {
                this.consoleService.logStringMessage("SynoLoader : " + errmsg);
            }
        };
    }).apply(Util);
}
