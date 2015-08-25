let {
    classes: Cc,
    interfaces: Ci,
    utils: Cu
} = Components;

Cu.import("resource://SynoLoader/DownloadManager.js");

if (typeof SL_Options === "undefined") {
    var SL_Options = {};

    (function() {
        this.wasConnecting = false;

        this.setUsernamePassword = () => {
            let loginManager = Cc["@mozilla.org/login-manager;1"]
                .getService(Ci.nsILoginManager);

            let loginInfo = new Components.Constructor(
                "@mozilla.org/login-manager/loginInfo;1",
                Ci.nsILoginInfo,
                "init"
            );

            // Ask for credentials
            let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"]
                .getService(Ci.nsIPromptService);
            let username = {
                value: ""
            };
            let password = {
                value: ""
            };

            let logins = loginManager.findLogins({}, "chrome://SynoLoader.Pass", null, "User Registration");
            for (let i = 0; i < logins.length; i++) {
                username = {
                    value: logins[i].username
                };
                password = {
                    value: logins[i].password
                };
                loginManager.removeLogin(logins[i]);
            }

            prompts.promptUsernameAndPassword(window, "", "Please enter your login for your SynoNas", username, password, null, {});

            let myLoginInfo = new loginInfo("chrome://SynoLoader.Pass", null, "User Registration", username.value, password.value, "", "");
            loginManager.addLogin(myLoginInfo);

            DownloadManager.username = username.value;
            DownloadManager.password = password.value;

            this.checkConnection();
        };

        this.checkConnection = () => {
            if (!DownloadManager.isConnecting) {
                DownloadManager.connectToNas();
                this.updateStatus();
                this.updateStatusInterval = setInterval(() => {
                    this.updateStatus();
                }, 500);
            }
        };

        this.setConnectionStatus = (status) => {
            document.getElementById("sl-connection-status-image").setAttribute("status", status);
        };

        this.updateStatus = () => {
            if (DownloadManager.isConnecting) {
                this.wasConnecting = true;
                this.setConnectionStatus("busy");
            } else if (this.wasConnecting) {
                if (DownloadManager.isConnected) {
                    this.setConnectionStatus("succeeded");
                } else {
                    this.setConnectionStatus("failed");
                }
                clearInterval(this.updateStatusInterval);
            }
        };

        this.onLoad = () => {
            if (DownloadManager.isConnected) {
                this.setConnectionStatus("succeeded");
            }
            this.updateStatus();
        };
    }).apply(SL_Options);

    window.addEventListener("load", function load(e) {
        window.removeEventListener("load", load, false); //remove listener, no longer needed
        SL_Options.onLoad();
    }, false);
}
