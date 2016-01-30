var EXPORTED_SYMBOLS = ["Notification"];

if (typeof Notification === "undefined") {
    var Notification = {};

    (function() {
        let alertInterface = Components.classes["@mozilla.org/alerts-service;1"]
            .getService(Components.interfaces.nsIAlertsService);

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
