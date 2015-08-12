const { classes: Cc, interfaces: Ci } = Components;

if (typeof SynoLoader === 'undefined') {
    var SynoLoader = {};

    Components.utils.import('resource://SynoLoader/DownloadManager.js', SynoLoader);

    (function () {
        this.SetUserNamePassword = function () {
            this.myLoginManager = Cc['@mozilla.org/login-manager;1']
                .getService(Ci.nsILoginManager);
            // create instance of LoginInfo
            this.nsLoginInfo = new Components.Constructor(
                '@mozilla.org/login-manager/loginInfo;1',
                Ci.nsILoginInfo,
                'init'
            );
            // ask for credentials
            this.prompts = Cc['@mozilla.org/embedcomp/prompt-service;1']
                .getService(Ci.nsIPromptService);

            var username = {
                value: ''
            };
            var password = {
                value: ''
            };
            var check = {
                value: false
            };

            var logins = this.myLoginManager.findLogins({}, 'chrome://SynoLoader.Pass', null, 'User Registration');
            for (var index = 0; index < logins.length; index++) {
                username = {
                    value: logins[index].username
                };
                password = {
                    value: logins[index].password
                };
                this.myLoginManager.removeLogin(logins[index]);
            }

            this.prompts.promptUsernameAndPassword(window, '', 'Please enter your login for your SynoNas', username, password, null, {});
            this.myLoginInfo = new this.nsLoginInfo('chrome://SynoLoader.Pass', null, 'User Registration', username.value, password.value, '', '');
            this.myLoginManager.addLogin(this.myLoginInfo);
            this.SynoLoader_DownloadManager.username = username.value;
            this.SynoLoader_DownloadManager.password = password.value;
        };

        this.checkConnection = function () {
            if (this.SynoLoader_DownloadManager.connecting === false) {
                this.SynoLoader_DownloadManager.connect_to_nas();
                this.UpdateStatus();
            }
        };

        this.option_init = function () {
            this.was_connecting = false;
            if (this.SynoLoader_DownloadManager.is_connect === true) {
                document.getElementById('SynoLoader_check_connection_image').setAttribute('style', 'list-style-image: url(chrome://SynoLoader/skin/approval.png)');
            }
            this.UpdateStatus();
            this.interval = window.setInterval(function () {
                SynoLoader.UpdateStatus();
            }, 500);
        };

        this.UpdateStatus = function () {
            if (this.SynoLoader_DownloadManager.connecting === true) {
                this.was_connecting = true;
                document.getElementById('SynoLoader_check_connection_image').setAttribute('style', 'list-style-image: url(chrome://SynoLoader/skin/hour_glass.png)');
            } else if (this.was_connecting === true) {
                if (this.SynoLoader_DownloadManager.is_connect === true) {
                    document.getElementById('SynoLoader_check_connection_image').setAttribute('style', 'list-style-image: url(chrome://SynoLoader/skin/approval.png)');
                } else {
                    document.getElementById('SynoLoader_check_connection_image').setAttribute('style', 'list-style-image: url(chrome://SynoLoader/skin/cancel.png)');
                }
            }
        };
    }).apply(SynoLoader);
}

window.addEventListener('load', function load (e) {
    window.removeEventListener('load', load, false); //remove listener, no longer needed
    SynoLoader.option_init();
}, false);
