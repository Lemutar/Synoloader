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

/**
 *	Create Observer function taken from a Mozilla tutorial at
 *	http://developer.mozilla.org/en/docs/Creating_Sandboxed_HTTP_Connections
 **/
Util.createObserver = function() {
    return ({
        observe: function(subject, topic, data) {},
        QueryInterface: function(iid) {
            if (!iid.equals(Ci.nsIObserver) &&
                !iid.equals(Ci.nsISupportsWeakReference) &&
                !iid.equals(Ci.nsISupports)) {
                throw Components.results.NS_ERROR_NO_INTERFACE;
            }
            return this;
        }
    });
};
