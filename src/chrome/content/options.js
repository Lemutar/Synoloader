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

    var username = {
        value: ""
    };
    var password = {
        value: ""
    };
    var check = {
        value: false
    };

    var logins = this.myLoginManager.findLogins({}, 'chrome://SynoLoader.Pass', null, 'User Registration');
    for (var index = 0; index < logins.length; index++) {
        username = {
            value: logins[index].username
        }
        password = {
            value: logins[index].password
        }
        this.myLoginManager.removeLogin(logins[index]);
    }

    this.prompts.promptUsernameAndPassword(window, '', 'Please enter your login for your SynoNas', username, password, null, {});
    this.myLoginInfo = new this.nsLoginInfo('chrome://SynoLoader.Pass',
        null, 'User Registration',
        username.value, password.value, "", "");
    this.myLoginManager.addLogin(this.myLoginInfo);
    this.SynoLoader_DownloadManager.username = username.value;
    this.SynoLoader_DownloadManager.password = password.value;

};

SynoLoader.checkConnection = function() {
    if(this.SynoLoader_DownloadManager.connecting === false) {
        this.SynoLoader_DownloadManager.connect_to_nas();
        this.UpdateStatus();
    }
};

SynoLoader.option_init = function() {
    SynoLoader.was_connecting = false;
    if(true === this.SynoLoader_DownloadManager.is_connect) {
        document.getElementById("SynoLoader_check_connection_image").setAttribute('style', "list-style-image: url('chrome://SynoLoader/skin/approval.png')");
    }
    this.UpdateStatus();
    this.interval = window.setInterval(function() {
        SynoLoader.UpdateStatus();
    }, 500);
};

SynoLoader.UpdateStatus = function() {
    if(this.SynoLoader_DownloadManager.connecting === true) {
        SynoLoader.was_connecting = true;
        document.getElementById("SynoLoader_check_connection_image").setAttribute('style', "list-style-image: url('chrome://SynoLoader/skin/hour_glass.png')");
    } else if (SynoLoader.was_connecting === true) {
        if(true === this.SynoLoader_DownloadManager.is_connect) {
            document.getElementById("SynoLoader_check_connection_image").setAttribute('style', "list-style-image: url('chrome://SynoLoader/skin/approval.png')");
        } else {
            document.getElementById("SynoLoader_check_connection_image").setAttribute('style', "list-style-image: url('chrome://SynoLoader/skin/cancel.png')");
        }
    }
};

window.addEventListener("load", function load(e) {
    window.removeEventListener("load", load, false); //remove listener, no longer needed
    SynoLoader.option_init();
}, false);

