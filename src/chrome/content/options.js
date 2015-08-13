const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

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

            this.SL_DownloadManager.username = username.value;
            this.SL_DownloadManager.password = password.value;

            this.checkConnection();
        };

        this.checkConnection = () => {
            if (!this.SL_DownloadManager.isConnecting) {
                this.SL_DownloadManager.connectToNas();
                this.updateStatus();
            }
        };

        this.setStatusImage = (img) => {
            document.getElementById("sl-connection-status-image").setAttribute("style", "list-style-image: url(chrome://SynoLoader/skin/" + img + ")");
        };

        this.updateStatus = () => {
            if (this.SL_DownloadManager.isConnecting) {
                this.wasConnecting = true;
                this.setStatusImage("hour_glass.png");
            } else if (this.wasConnecting) {
                if (this.SL_DownloadManager.isConnected) {
                    this.setStatusImage("approval.png");
                } else {
                    this.setStatusImage("cancel.png");
                }
            }
        };

        this.onLoad = () => {
            if (this.SL_DownloadManager.isConnected) {
                this.setStatusImage("approval.png");
            }
            this.updateStatus();
            this.interval = window.setInterval(() => {
                SL_Options.updateStatus();
            }, 500);
        };
    }).apply(SL_Options);

    window.addEventListener("load", function load (e) {
        window.removeEventListener("load", load, false); //remove listener, no longer needed
        SL_Options.onLoad();
    }, false);
}

