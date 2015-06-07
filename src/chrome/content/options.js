var SynoLoader = {};
Components.utils.import("resource://SynoLoader/DownloadManager.js", SynoLoader);

SynoLoader.SetUserNamePassword = function() {
    this.myLoginManager = Components.classes["@mozilla.org/login-manager;1"]
        .getService(Components.interfaces.nsILoginManager);
    // create instance of LoginInfo
    this.nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
        Components.interfaces.nsILoginInfo,
        "init");
    // ask for credentials
    this.prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
        .getService(Components.interfaces.nsIPromptService);

    var prompt_username_and_passwrd_ok = this.prompts.promptUsernameAndPassword(window, '', 'Please enter your login for your SynoNas', this.username, this.password, null, {});
    if (prompt_username_and_passwrd_ok) {
        this.myLoginInfo = new this.nsLoginInfo('chrome://SynoLoader.Pass',
            null, 'User Registration',
            this.username.value, this.password.value, "", "");
        this.myLoginManager.addLogin(this.myLoginInfo);

        this.SynoLoader_DownloadManager.username = this.username.value;
        this.SynoLoader_DownloadManager.password = this.password.value;
        this.SynoLoader_DownloadManager.connect_to_nas("");
    }
    var logins = this.myLoginManager.findLogins({}, 'chrome://SynoLoader.Pass', null, 'User Registration');
    for (var i = 0; i < logins.length; i++) {
        if (logins[i].username == this.username) {
            this.myLoginManager.removeLogin(logins[i]);
            break;
        }
    }
};

SynoLoader.init = function() {
    this.SynoLoader_DownloadManager.connect_to_nas("");
    this.UpdateStatus();
    this.interval = window.setInterval(function() {
        SynoLoader.UpdateStatus();
    }, 1000);
};

SynoLoader.UpdateStatus = function() {
    if (true === this.SynoLoader_DownloadManager.is_connect) {
        document.getElementById("SynoLoader_status_image").setAttribute("src", "chrome://SynoLoader/skin/connected.png");
        document.getElementById("SynoLoader_status_lable").value = "connected";
    } else {
        document.getElementById("SynoLoader_status_image").setAttribute("src", "chrome://SynoLoader/skin/notconnect.png");
        document.getElementById("SynoLoader_status_lable").value = "not connected";
    }
};

window.addEventListener("load", function load(e) {
    window.removeEventListener("load", load, false); //remove listener, no longer needed
    SynoLoader.init();
}, false);
