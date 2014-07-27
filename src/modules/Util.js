var EXPORTED_SYMBOLS = ["Util"];

Util = function() {};

Util.consoleService = Components.classes["@mozilla.org/consoleservice;1"]
    .getService(Components.interfaces.nsIConsoleService);
Util.show_log = true;
Util.log = function(errmsg) {
    if (this.show_log === true) {
        this.consoleService.logStringMessage("SynoLoader : " + errmsg);
    }
};


