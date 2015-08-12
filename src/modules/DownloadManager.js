var EXPORTED_SYMBOLS = ['SL_DownloadManager'];
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (typeof SL_DownloadManager === "undefined") {
    var SL_DownloadManager = {};

    Cu.import('resource://SynoLoader/FileDownloaderHandler.js', SL_DownloadManager);
    Cu.import('resource://SynoLoader/MagnetHandler.js', SL_DownloadManager);
    Cu.import('resource://SynoLoader/Notification.js', SL_DownloadManager);
    Cu.import('resource://SynoLoader/QuickConnect.js', SL_DownloadManager);
    Cu.import('resource://SynoLoader/Util.js', SL_DownloadManager);

    (function () {
        let quickConnectRelayTimeOutInMs = 8000,
            quickConnectLocalTimeOutInMs = 8000,
            loginManager = Cc['@mozilla.org/login-manager;1'].
                               getService(Ci.nsILoginManager),
            prefs = Cc['@mozilla.org/preferences-service;1'].
                        getService(Ci.nsIPrefService).
                        getBranch('extensions.SynoLoader.');


        this.isConnected = false;
        this.isConnecting = false;
        this.password = '';
        this.username = '';
        this.protocol = 'undefined';

        prefs.QueryInterface(Ci.nsIPrefBranch2);
        prefs.addObserver('', this, false);

        this.Notification.show_notif = prefs.getBoolPref('show_notif');
        this.Util.show_log = prefs.getBoolPref('show_debug');
        this.MagnetHandler.set_active(prefs.getBoolPref('use_magnet'));

        // Find users for the given parameters
        let logins = loginManager.findLogins({}, 'chrome://SynoLoader.Pass', null, 'User Registration');
        if (logins.length > 0) {
            this.username = logins[0].username;
            this.password = logins[0].password;
        }

        this.parseURL = function (url) {
            let pattern = RegExp("^(.*:)//([A-Za-z0-9\-\.]+)(:[0-9]+)?(.*)$");
            let matches = url.match(pattern);
            if (matches === null) {
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

        this.convertOldURL = function (url_string) {
            if (prefs.getCharPref('host') === '') {
                this.Util.log(url_string);
                var url = this.parseURL(url_string);
                if (url.protocol !== undefined) {
                    prefs.setCharPref('protocol', url.protocol.replace(':', ''));
                }

                if (url.port !== undefined) {
                    prefs.setCharPref('port', url.port.replace(':', ''));
                    this.Util.log(url.port);
                }

                if (url.host !== undefined) {
                    prefs.setCharPref('host', url.host);
                }
            }
        };

        this.setProtocol = function () {
            switch (prefs.getCharPref('dsm_version')) {
                case '1':
                    this.Util.log('Set Protocol to < DSM 4.1');
                    Cu.import('resource://SynoLoader/Protocol.js', this);
                    this.protocol = this.Protocol(this.urlToConnect, 50000, this.username, this.password);
                    break;
                case '2':
                    this.Util.log('Set Protocol to >= DSM 4.1');
                    Cu.import('resource://SynoLoader/Protocol_API.js', this);
                    this.protocol = this.Protocol(this.urlToConnect, 50000, this.username, this.password);
                    break;
            }
        };

        this.connectToNas = function () {
            this.isConnecting = true;
            this.convertOldURL(prefs.getCharPref('url'));
            var protocol = prefs.getCharPref('protocol'),
                port = prefs.getCharPref('port'),
                host = prefs.getCharPref('host');
            var quick_connect = this.QuickConnect(
                quickConnectRelayTimeOutInMs,
                quickConnectLocalTimeOutInMs,
                protocol + '://',
                port
            );
            this.urlToConnect = protocol + '://';
            quick_connect.get(host, function (response) {
                if (response.success) {
                    SL_DownloadManager.urlToConnect += response.ip + ':' + port;
                } else {
                    SL_DownloadManager.urlToConnect += host + ':' + port;
                }
                SL_DownloadManager.setProtocol();
                SL_DownloadManager.protocol.password = SL_DownloadManager.password;
                SL_DownloadManager.protocol.username = SL_DownloadManager.username;
                SL_DownloadManager.protocol.connect(function (response) {
                    SL_DownloadManager.isConnected = response.success;
                    SL_DownloadManager.isConnecting = false;
                });
            });
        };

        this.transferToNas = function (link) {
            if (link.toLowerCase().endsWith('.torrent') && this.protocol.version > 0) {
                var file = Cc['@mozilla.org/file/directory_service;1'].
                               getService(Ci.nsIProperties).
                               get('TmpD', Ci.nsIFile),
                    uuidGenerator = Cc['@mozilla.org/uuid-generator;1'].
                                        getService(Ci.nsIUUIDGenerator),
                    uuid = uuidGenerator.generateUUID().toString().replace('{', '').replace('}', '');
                file.append('synoloader' + uuid + '.torrent');
                file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0666);
                this.FileDownloaderHandler.get_file_content(
                    link,
                    file.path,
                    function () {
                        SL_DownloadManager.protocol.task_action(
                            function (response) {
                                if (response.success === true) {
                                    SL_DownloadManager.Notification.show('Send torrent file to NAS', link);
                                } else {
                                    SL_DownloadManager.Notification.show('Send link failed', response.error_text);
                                }
                            },
                            'add_file',
                            file
                        );
                    }
                );
            } else {
                this.protocol.task_action(
                    function (response) {
                        if (response.success === true) {
                            SL_DownloadManager.Notification.show('Send link', link);
                        } else {
                            SL_DownloadManager.Notification.show('Send link failed', response.error_text);
                        }
                    },
                    'addurl',
                    link
                );
            }
        };

        this.delete_all = function () {
            this.Util.log('delete_all');
            this.load_download_list(
                function (items) {
                    items.forEach(function (item) {
                        SL_DownloadManager.Util.log('delete ' + item.id);
                        SL_DownloadManager.protocol.task_action(function () {}, 'delete', item.id);
                    });
                },
                function (response) {
                    SL_DownloadManager.Util.log('load_download_list: ' + response.error_text);
                }
            );
        };

        this.load_download_list = function (manage_items_success, manage_items_fail) {
            this.protocol.task_action(
                function (response) {
                    if (response.success === true) {
                        manage_items_success(response.items);
                    } else {
                        manage_items_fail(response);
                    }
                },
                'getall'
            );
        };

        this.observe = function (subject, topic, data) {
            if (topic === 'nsPref:changed') {
                switch (data) {
                    case 'show_notif':
                        this.Notification.show_notif = prefs.getBoolPref('show_notif');
                        break;
                    case 'show_debug':
                        this.Util.show_log = prefs.getBoolPref('show_debug');
                        break;
                    case 'use_magnet':
                        this.MagnetHandler.set_active(prefs.getBoolPref('use_magnet'));
                        break;
                }
            }
        };

        this.httpResponseObserver = this.MagnetHandler.createObserver();
        this.httpResponseObserver.observe = function (aSubject, aTopic, aData) {
            this.Util.log('observer');
            if (aTopic === 'magnet-on-open-uri') {
                var aURI = aSubject.QueryInterface(Ci.nsIURI);
                if (!aURI) return;
                this.transferToNas(aURI.spec);
            }
        };

        this.observerService = Cc['@mozilla.org/observer-service;1'].
                                   getService(Ci.nsIObserverService);

        this.observerService.addObserver(this.httpResponseObserver, 'magnet-on-open-uri', false);

    }).apply(SL_DownloadManager);
}
