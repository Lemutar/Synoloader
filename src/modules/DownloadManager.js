var EXPORTED_SYMBOLS = ['SynoLoader_DownloadManager'];
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (SynoLoader_DownloadManager === void(0)) {
    var SynoLoader_DownloadManager = {};

    Cu.import('resource://SynoLoader/FileDownloaderHandler.js', SynoLoader_DownloadManager);
    Cu.import('resource://SynoLoader/MagnetHandler.js', SynoLoader_DownloadManager);
    Cu.import('resource://SynoLoader/Notification.js', SynoLoader_DownloadManager);
    Cu.import('resource://SynoLoader/QuickConnect.js', SynoLoader_DownloadManager);
    Cu.import('resource://SynoLoader/Util.js', SynoLoader_DownloadManager);

    (function () {
        let quickConnectRelayTimeOutInMs = 8000,
            quickConnectLocalTimeOutInMs = 8000,
            loginManager = Cc['@mozilla.org/login-manager;1'].
                               getService(Ci.nsILoginManager);

        this.isConnected = false;
        this.isConnecting = false;
        this.password = '';
        this.username = '';
        this.list = [];
        this.protocol = 'undefined';
        this.preferences = Cc['@mozilla.org/preferences-service;1'].
                               getService(Ci.nsIPrefService).
                               getBranch('extensions.SynoLoader.');

        this.preferences.QueryInterface(Ci.nsIPrefBranch2);
        this.preferences.addObserver('', this, false);

        this.Notification.show_notif = this.preferences.getBoolPref('show_notif');
        this.Util.show_log = this.preferences.getBoolPref('show_debug');
        this.MagnetHandler.set_active(this.preferences.getBoolPref('use_magnet'));

        // Find users for the given parameters
        let logins = loginManager.findLogins({}, 'chrome://SynoLoader.Pass', null, 'User Registration');
        if (logins.length > 0) {
            this.username = logins[0].username;
            this.password = logins[0].password;
        }

        this.parse_url = function (url) {
            var pattern = new RegExp("^(.*:)//([A-Za-z0-9\-\.]+)(:[0-9]+)?(.*)$"),
                matches = url.match(pattern);
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

        this.convert_old_url = function (url_string) {
            if (this.preferences.getCharPref('host') === '') {
                this.Util.log(url_string);
                var url = this.parse_url(url_string);
                if (url.protocol !== undefined) {
                    this.preferences.setCharPref('protocol', url.protocol.replace(':', ''));
                }

                if (url.port !== undefined) {
                    this.preferences.setCharPref('port', url.port.replace(':', ''));
                    this.Util.log(url.port);
                }

                if (url.host !== undefined) {
                    this.preferences.setCharPref('host', url.host);
                }
            }
        };

        this.set_protocol = function () {
            switch (this.preferences.getCharPref('dsm_version')) {
                case '1':
                    this.Util.log('Set Protocol to < DSM 4.1');
                    Cu.import('resource://SynoLoader/Protocol.js', SynoLoader_DownloadManager);
                    this.protocol = this.Protocol(this.url_to_connect, 50000, this.username, this.password);
                    break;
                case '2':
                    this.Util.log('Set Protocol to >= DSM 4.1');
                    Cu.import('resource://SynoLoader/Protocol_API.js', SynoLoader_DownloadManager);
                    this.protocol = this.Protocol(this.url_to_connect, 50000, this.username, this.password);
                    break;
            }
        };

        this.connect_to_nas = function () {
            this.isConnecting = true;
            this.convert_old_url(this.preferences.getCharPref('url'));
            var protocol = this.preferences.getCharPref('protocol'),
                port = this.preferences.getCharPref('port'),
                host = this.preferences.getCharPref('host');
            var quick_connect = this.QuickConnect(
                quickConnectRelayTimeOutInMs,
                quickConnectLocalTimeOutInMs,
                protocol + '://',
                port
            );
            this.url_to_connect = protocol + '://';
            quick_connect.get(host, function (response) {
                if (response.success) {
                    SynoLoader_DownloadManager.url_to_connect += response.ip + ':' + port;
                } else {
                    SynoLoader_DownloadManager.url_to_connect += host + ':' + port;
                }
                SynoLoader_DownloadManager.set_protocol();
                SynoLoader_DownloadManager.protocol.password = SynoLoader_DownloadManager.password;
                SynoLoader_DownloadManager.protocol.username = SynoLoader_DownloadManager.username;
                SynoLoader_DownloadManager.protocol.connect(function (response) {
                    SynoLoader_DownloadManager.isConnected = response.success;
                    SynoLoader_DownloadManager.isConnecting = false;
                });
            });
        };

        this.transfer_to_nas = function (link) {
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
                        SynoLoader_DownloadManager.protocol.task_action(
                            function (response) {
                                if (response.success === true) {
                                    SynoLoader_DownloadManager.Notification.show('Send torrent file to NAS', link);
                                } else {
                                    SynoLoader_DownloadManager.Notification.show('Send link failed', response.error_text);
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
                            SynoLoader_DownloadManager.Notification.show('Send link', link);
                        } else {
                            SynoLoader_DownloadManager.Notification.show('Send link failed', response.error_text);
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
                        SynoLoader_DownloadManager.Util.log('delete ' + item.id);
                        SynoLoader_DownloadManager.protocol.task_action(function () {}, 'delete', item.id);
                    });
                },
                function (response) {
                    SynoLoader_DownloadManager.Util.log('load_download_list: ' + response.error_text);
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

        // TODO: Not used.
        this.get_list = function () {
            return this.list;
        };

        this.observe = function (subject, topic, data) {
            if (topic === 'nsPref:changed') {
                switch (data) {
                    case 'show_notif':
                        this.Notification.show_notif = this.preferences.getBoolPref('show_notif');
                        break;
                    case 'show_debug':
                        this.Util.show_log = this.preferences.getBoolPref('show_debug');
                        break;
                    case 'use_magnet':
                        this.MagnetHandler.set_active(this.preferences.getBoolPref('use_magnet'));
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
                this.transfer_to_nas(aURI.spec);
            }
        };

        this.observerService = Cc['@mozilla.org/observer-service;1'].
                                   getService(Ci.nsIObserverService);

        this.observerService.addObserver(this.httpResponseObserver, 'magnet-on-open-uri', false);

    }).apply(SynoLoader_DownloadManager);
}
