var EXPORTED_SYMBOLS = ["SynoLoader_DownloadManager"];


if (typeof SynoLoader_DownloadManager == "undefined") {
    var SynoLoader_DownloadManager = {};

    Components.utils.import("resource://SynoLoader/FileDownloaderHandler.js", SynoLoader_DownloadManager);
    Components.utils.import("resource://SynoLoader/Util.js", SynoLoader_DownloadManager);
    Components.utils.import("resource://SynoLoader/Notification.js", SynoLoader_DownloadManager);
    Components.utils.import("resource://SynoLoader/magnetHandler.js", SynoLoader_DownloadManager);
    Components.utils.import("resource://SynoLoader/QuickConnect.js", SynoLoader_DownloadManager);

    (function () {

        const quickConnectRelayTimeOutInMs = 8000;
        const quickConnectLocalTimeOutInMs = 8000;

        this.password = "";
        this.username = "";
        this.is_connect = false;
        this.list = [];
        this.protocol = "undefined";
        this.preferences = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefService)
            .getBranch("extensions.SynoLoader.");

        this.preferences.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this.preferences.addObserver("", this, false);
        SynoLoader_DownloadManager.Notification.show_not = this.preferences.getBoolPref('show_not');
        SynoLoader_DownloadManager.Util.show_log = this.preferences.getBoolPref('show_dgb');
        SynoLoader_DownloadManager.magnetHandler.set_active(SynoLoader_DownloadManager.preferences.getBoolPref('use_magnet'));


        var LoginManager = Components.classes["@mozilla.org/login-manager;1"].
            getService(Components.interfaces.nsILoginManager);

        // Find users for the given parameters
        var logins = LoginManager.findLogins({}, 'chrome://SynoLoader.Pass', null, 'User Registration');
        if (logins.length > 0) {
            SynoLoader_DownloadManager.username = logins[0].username;
            SynoLoader_DownloadManager.password = logins[0].password;
        }

        this.parse_url = function parse_url(url) {
            var pattern = RegExp("^(.*:)//([A-Za-z0-9\-\.]+)(:[0-9]+)?(.*)$");
            var matches =  url.match(pattern);
            if(matches === null) {
                return {
                    protocol: undefined,
                    host: url,
                    port: undefined
                };
            }
            return {
                protocol: matches[1],
                host: matches[2],
                port: matches[3]
            };
        };

        this.convert_old_url = function (url_string) {
            SynoLoader_DownloadManager.Util.log(this.preferences.getCharPref('host'));
            if (this.preferences.getCharPref('host') === "") {
                SynoLoader_DownloadManager.Util.log(url_string);
                var url = this.parse_url(url_string)
                if(url.protocol !== undefined) {
                    this.preferences.setCharPref('protocol',url.protocol.replace(":",""));
                }

                if(url.port !== undefined) {
                    this.preferences.setCharPref('port',url.port.replace(":",""));
                    SynoLoader_DownloadManager.Util.log(url.port);
                }

                if(url.host !== undefined) {
                    this.preferences.setCharPref('host',url.host);
                }
            }
        };

        this.connect_to_nas = function () {
            this.convert_old_url(this.preferences.getCharPref('url'));
            var protocol = this.preferences.getCharPref('protocol');
            var port = this.preferences.getCharPref('port');
            var host = this.preferences.getCharPref('host');
            quick_connect = SynoLoader_DownloadManager.QuickConnect(
                quickConnectRelayTimeOutInMs,
                quickConnectLocalTimeOutInMs,
                protocol + "://",
                port);
            this.url_to_connect =  protocol + "://"
            quick_connect.get(host, function(response) {
                if(response.success) {
                    url_to_connect +=  response.ip + ":" + port
                } else {
                    url_to_connect +=  host + ":" + port
                }
                SynoLoader_DownloadManager.Util.log("try to connect to " + url_to_connect);
                this.set_protocol();
                this.protocol.password = this.password;
                this.protocol.username = this.username;
                this.protocol.conect(function (response) {
                    SynoLoader_DownloadManager.is_connect = response.success;
                });
            });
        };

        this.set_protocol = function () {
            switch (this.preferences.getCharPref('DSM_Verison')) {
                case "1":
                    SynoLoader_DownloadManager.Util.log("Set Protocol to < DMS 4.1");
                    Components.utils.import("resource://SynoLoader/Protocol.js", SynoLoader_DownloadManager);
                    this.protocol = SynoLoader_DownloadManager.Protocol(this.url_to_connect, 50000, this.username, this.password);
                    break;
                case "2":
                    SynoLoader_DownloadManager.Util.log("Set Protocol to > DMS 4.1");
                    Components.utils.import("resource://SynoLoader/Protocol_API.js", SynoLoader_DownloadManager);
                    this.protocol = SynoLoader_DownloadManager.Protocol(this.url_to_connect, 50000, this.username, this.password);
                    break;
            }
        };

        this.connect_to_nas();


        this.transfer_to_nas = function (link) {
            if (link.toLowerCase().endsWith(".torrent") && SynoLoader_DownloadManager.protocol.version > 0) {
                var file = Components.classes["@mozilla.org/file/directory_service;1"]
                    .getService(Components.interfaces.nsIProperties)
                    .get("TmpD", Components.interfaces.nsIFile);
                var uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"]
                    .getService(Components.interfaces.nsIUUIDGenerator);
                var uuid = uuidGenerator.generateUUID();
                var uuidString = uuid.toString();
                uuidString = uuidString.replace('{', '').replace('}', '');
                file.append("synoloader" + uuidString + ".torrent");
                file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
                SynoLoader_DownloadManager.FileDownloaderHandler.get_file_content(link, file.path,
                    function () {
                        SynoLoader_DownloadManager.protocol.task_action(function (response) {

                                if (response.success === true) {
                                    SynoLoader_DownloadManager.Notification.show("Send torrent file to NAS", link);
                                } else {
                                    SynoLoader_DownloadManager.Notification.show("Send link failed", response.error_text);
                                }

                            },
                            'add_file',
                            file);
                    });
            } else {
                this.protocol.task_action(function (response) {
                        if (response.success === true) {
                            SynoLoader_DownloadManager.Notification.show("Send link", link);
                        } else {
                            SynoLoader_DownloadManager.Notification.show("Send link failed", response.error_text);
                        }

                    },
                    'addurl',
                    link);

            }


        };

        this.delete_all = function () {
            SynoLoader_DownloadManager.Util.log("delete_all");
            SynoLoader_DownloadManager.load_download_list(function (items) {
                items.forEach(function (item) {
                    SynoLoader_DownloadManager.Util.log("delete " + item.id);
                    SynoLoader_DownloadManager.protocol.task_action(function () {
                    }, 'delete', item.id);
                });

            }, function (response) {
                SynoLoader_DownloadManager.Util.log("load_download_list: " + response.error_text);
            });

        };

        this.load_download_list = function (manage_items_success, manage_items_fail) {
            this.protocol.task_action(function (response) {
                    if (response.success === true) {
                        manage_items_success(response.items);
                    } else {
                        manage_items_fail(response);
                    }

                },
                'getall');
        };


        this.get_list = function () {
            return this.list;
        };


        this.observe = function (subject, topic, data) {
            if (topic == "nsPref:changed") {
                switch (data) {
                    case 'url':
                        SynoLoader_DownloadManager.url = SynoLoader_DownloadManager.preferences.getCharPref('url');
                        SynoLoader_DownloadManager.set_protocol();
                        break;
                    case 'show_not':
                        SynoLoader_DownloadManager.Notification.show_not = SynoLoader_DownloadManager.preferences.getBoolPref('show_not');
                        break;
                    case 'show_dgb':
                        SynoLoader_DownloadManager.Util.show_log = SynoLoader_DownloadManager.preferences.getBoolPref('show_dgb');
                        break;
                    case 'DSM_Verison':
                        SynoLoader_DownloadManager.set_protocol();
                        break;
                    case 'use_magnet':
                        SynoLoader_DownloadManager.magnetHandler.set_active(SynoLoader_DownloadManager.preferences.getBoolPref('use_magnet'));
                        break;
                }
            }
        };

        this.httpResponseObserver = SynoLoader_DownloadManager.magnetHandler.createObserver();
        this.httpResponseObserver.observe = function (aSubject, aTopic, aData) {
            SynoLoader_DownloadManager.Util.log("observer");
            if (aTopic == 'magnet-on-open-uri') {
                var aURI = aSubject.QueryInterface(Components.interfaces.nsIURI);
                if (!aURI) return;
                var uriText = aURI.spec;
                SynoLoader_DownloadManager.transfer_to_nas(uriText);
            }
        };

        this.observerService = Components.classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService);

        this.observerService.addObserver(SynoLoader_DownloadManager.httpResponseObserver, "magnet-on-open-uri", false);


    }).apply(SynoLoader_DownloadManager);


}
