let { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (typeof SL_Options === "undefined") {
    var SL_Options = {};

    Cu.import("resource://SynoLoader/DownloadManager.js", SL_Options);

    (function () {
        this.wasConnecting = false;

        this.setUsernamePassword = () => {
            let loginManager = Cc["@mozilla.org/login-manager;1"].
                                   getService(Ci.nsILoginManager),
                // create instance of LoginInfo
                loginInfo = new Components.Constructor(
                    "@mozilla.org/login-manager/loginInfo;1",
                    Ci.nsILoginInfo,
                    "init"
                ),
                // ask for credentials
                prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].
                               getService(Ci.nsIPromptService),
                username = {
                    value: ""
                },
                password = {
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

            this.DownloadManager.username = username.value;
            this.DownloadManager.password = password.value;

            this.checkConnection();
        };

        this.checkConnection = () => {
            if (!this.DownloadManager.isConnecting) {
                this.DownloadManager.connectToNas();
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
            if (this.DownloadManager.isConnecting) {
                this.wasConnecting = true;
                this.setConnectionStatus("busy");
            } else if (this.wasConnecting) {
                if (this.DownloadManager.isConnected) {
                    this.setConnectionStatus("succeeded");
                } else {
                    this.setConnectionStatus("failed");
                }
                clearInterval(this.updateStatusInterval);
            }
        };

        this.onLoad = () => {
            if (this.DownloadManager.isConnected) {
                this.setConnectionStatus("succeeded");
            }
            this.updateStatus();
        };
    }).apply(SL_Options);

    window.addEventListener("load", function load (e) {
        window.removeEventListener("load", load, false); //remove listener, no longer needed
        SL_Options.onLoad();
    }, false);
}

