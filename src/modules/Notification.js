var EXPORTED_SYMBOLS = ['Notification'];
const { classes: Cc, interfaces: Ci } = Components;

if (typeof Notification === 'undefined') {
    var Notification = {};

    (function () {
        try {
            Notification.AlertInterface = Cc['@mozilla.org/alerts-service;1']
                .getService(Ci.nsIAlertsService);
        } catch (e) {
            // prevents runtime error on platforms that don't implement nsIAlertsService
        }

        this.show_not = false;
        this.show = function (title, text) {
            if (Notification.show_not) {
                try {
                    Notification.AlertInterface.showAlertNotification('chrome://SynoLoader/skin/Syno.png', title, text, false, '', null);
                } catch (e) {
                    // prevents runtime error on platforms that don't implement nsIAlertsService
                }
            }
        };
    }).apply(Notification);
}
