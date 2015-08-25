var EXPORTED_SYMBOLS = ["Notification"];
let {
    classes: Cc,
    interfaces: Ci
} = Components;

if (typeof Notification === "undefined") {
    var Notification = {};

    (function() {
        let alertInterface = Cc["@mozilla.org/alerts-service;1"]
            .getService(Ci.nsIAlertsService);

        this.showNotif = false;

        this.show = (title, text) => {
            if (this.showNotif) {
                try {
                    alertInterface.showAlertNotification("chrome://SynoLoader/skin/synoloader32.png", title, text, false, "", null);
                } catch (e) {
                    // Prevents runtime error on platforms that don't implement nsIAlertsService, like Mac OSX.
                }
            }
        };
    }).apply(Notification);
}
