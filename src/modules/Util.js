var EXPORTED_SYMBOLS = ["Util"];
let {
    classes: Cc,
    interfaces: Ci,
    utils: Cu
} = Components;

Cu.import("resource://gre/modules/devtools/Console.jsm");

if (typeof Util === "undefined") {
    var Util = {};

    (function() {
        this.showLog = true;

        this.log = (msg, doit) => {
            if (this.showLog || doit === true) {
                console.log("SynoLoader : " + msg);
            }
        };

        this.val = (str, context) => {
            let scope = context || window,
                properties = str.split('.');
            for (let i = 0; i < properties.length; i++) {
                if (!scope[properties[i]]) {
                    return null;
                }
                scope = scope[properties[i]];
            }
            return scope;
        };
    }).apply(Util);
}
