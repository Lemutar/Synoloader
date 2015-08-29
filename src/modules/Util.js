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

        this.log = (msg, force) => {
            if (this.showLog || force) {
                console.log('SL: ' + msg);
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

        this.defaultFor = (arg, val) => {
            return (typeof arg !== 'undefined') ? arg : val;
        };
    }).apply(Util);
}
