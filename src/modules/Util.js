var EXPORTED_SYMBOLS = ["Util"];
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (typeof Util === "undefined") {
    var Util = {};

    Cu.import("resource://gre/modules/devtools/Console.jsm", Util);

    (function () {
        this.show_log = true;
        this.consoleService = Cc["@mozilla.org/consoleservice;1"].
                                  getService(Ci.nsIConsoleService);

        this.log = (msg, doit) => {
            if (this.show_log || doit === true) {
                this.console.log("SynoLoader : " + msg);
                this.consoleService.logStringMessage("SynoLoader : " + msg);
            }
        };

        this.val = (str, context) => {
            let scope = context || window,
                properties = str.split('.'), i;
            for(let i = 0; i < properties.length; i++) {
              if (!scope[properties[i]]) {
                 return null;
              }
              scope = scope[properties[i]];
            }
            return scope;
        };
    }).apply(Util);
}
