var EXPORTED_SYMBOLS = ["Debug"];

Debug = function() {};

Debug.consoleService = Components.classes["@mozilla.org/consoleservice;1"]
    .getService(Components.interfaces.nsIConsoleService);
Debug.show_log = true;
Debug.log = function(errmsg) {
    if (this.show_log === true) {
        this.consoleService.logStringMessage("SynoLoader Error: " + errmsg);
    }
};
