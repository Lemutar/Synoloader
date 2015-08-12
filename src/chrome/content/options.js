const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (SL_Options === void(0)) {
    var SL_Options = {};

    Cu.import("resource://SynoLoader/DownloadManager.js", SL_Options);

    (function () {
        this.wasConnecting = false;

        this.init = function () {
            if (this.SynoLoader_DownloadManager.isConnected) {
                document.getElementById("SynoLoader_check_connection_image").setAttribute("style", "list-style-image: url(chrome://SynoLoader/skin/approval.png)");
            }
            this.updateStatus();
            this.interval = window.setInterval(function () {
                SL_Options.updateStatus();
            }, 500);
        };

        this.setUsernamePassword = function () {
            let loginManager = Cc["@mozilla.org/login-manager;1"].
                                      getService(Ci.nsILoginManager);
            // create instance of LoginInfo
            let loginInfo = new Components.Constructor(
                "@mozilla.org/login-manager/loginInfo;1",
                Ci.nsILoginInfo,
                "init"
            );
            // ask for credentials
            let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].
                               getService(Ci.nsIPromptService);

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

            this.SynoLoader_DownloadManager.username = username.value;
            this.SynoLoader_DownloadManager.password = password.value;

            this.checkConnection();
        };

        this.checkConnection = function () {
            if (!this.SynoLoader_DownloadManager.isConnecting) {
                this.SynoLoader_DownloadManager.connect_to_nas();
                this.updateStatus();
            }
        };

        this.updateStatus = function () {
            if (this.SynoLoader_DownloadManager.isConnecting) {
                this.wasConnecting = true;
                document.getElementById("SynoLoader_check_connection_image").setAttribute("style", "list-style-image: url(chrome://SynoLoader/skin/hour_glass.png)");
            } else if (this.wasConnecting) {
                if (this.SynoLoader_DownloadManager.isConnected) {
                    document.getElementById("SynoLoader_check_connection_image").setAttribute("style", "list-style-image: url(chrome://SynoLoader/skin/approval.png)");
                } else {
                    document.getElementById("SynoLoader_check_connection_image").setAttribute("style", "list-style-image: url(chrome://SynoLoader/skin/cancel.png)");
                }
            }
        };
    }).apply(SL_Options);
}

window.addEventListener("load", function load (e) {
    window.removeEventListener("load", load, false); //remove listener, no longer needed
    SL_Options.init();
}, false);
