var EXPORTED_SYMBOLS = ['SynoLoader_DownloadManager'];
const { classes: Cc, interfaces: Ci } = Components;

if (typeof SynoLoader_DownloadManager === 'undefined') {
    var SynoLoader_DownloadManager = {};

    Components.utils.import('resource://SynoLoader/FileDownloaderHandler.js', SynoLoader_DownloadManager);
    Components.utils.import('resource://SynoLoader/MagnetHandler.js', SynoLoader_DownloadManager);
    Components.utils.import('resource://SynoLoader/Notification.js', SynoLoader_DownloadManager);
    Components.utils.import('resource://SynoLoader/QuickConnect.js', SynoLoader_DownloadManager);
    Components.utils.import('resource://SynoLoader/Util.js', SynoLoader_DownloadManager);

    (function () {
        var quickConnectRelayTimeOutInMs = 8000;
        var quickConnectLocalTimeOutInMs = 8000;
        this.connecting = false;
        this.password = '';
        this.username = '';
        this.is_connect = false;
        this.list = [];
        this.protocol = 'undefined';
        this.preferences = Cc['@mozilla.org/preferences-service;1']
            .getService(Ci.nsIPrefService)
            .getBranch('extensions.SynoLoader.');

        this.preferences.QueryInterface(Ci.nsIPrefBranch2);
        this.preferences.addObserver('', this, false);

        this.Notification.show_not = this.preferences.getBoolPref('show_not');
        this.Util.show_log = this.preferences.getBoolPref('show_dbg');
        this.MagnetHandler.set_active(this.preferences.getBoolPref('use_magnet'));

        var LoginManager = Cc['@mozilla.org/login-manager;1']
            .getService(Ci.nsILoginManager);

        // Find users for the given parameters
        var logins = LoginManager.findLogins({}, 'chrome://SynoLoader.Pass', null, 'User Registration');
        if (logins.length > 0) {
            this.username = logins[0].username;
            this.password = logins[0].password;
        }

        this.parse_url = function (url) {
            var pattern = RegExp('^(.*:)//([A-Za-z0-9\-\.]+)(:[0-9]+)?(.*)$');
            var matches = url.match(pattern);
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
            if (SynoLoader_DownloadManager.preferences.getCharPref('host') === '') {
                SynoLoader_DownloadManager.Util.log(url_string);
                var url = SynoLoader_DownloadManager.parse_url(url_string);
                if (url.protocol !== undefined) {
                    SynoLoader_DownloadManager.preferences.setCharPref('protocol', url.protocol.replace(':', ''));
                }

                if (url.port !== undefined) {
                    SynoLoader_DownloadManager.preferences.setCharPref('port', url.port.replace(':', ''));
                    SynoLoader_DownloadManager.Util.log(url.port);
                }

                if (url.host !== undefined) {
                    SynoLoader_DownloadManager.preferences.setCharPref('host', url.host);
                }
            }
        };

        this.set_protocol = function () {
            switch (SynoLoader_DownloadManager.preferences.getCharPref('dsm_version')) {
                case '1':
                    SynoLoader_DownloadManager.Util.log('Set Protocol to < DSM 4.1');
                    Components.utils.import('resource://SynoLoader/Protocol.js', SynoLoader_DownloadManager);
                    SynoLoader_DownloadManager.protocol = SynoLoader_DownloadManager.Protocol(SynoLoader_DownloadManager.url_to_connect, 50000, SynoLoader_DownloadManager.username, SynoLoader_DownloadManager.password);
                    break;
                case '2':
                    SynoLoader_DownloadManager.Util.log('Set Protocol to >= DSM 4.1');
                    Components.utils.import('resource://SynoLoader/Protocol_API.js', SynoLoader_DownloadManager);
                    SynoLoader_DownloadManager.protocol = SynoLoader_DownloadManager.Protocol(SynoLoader_DownloadManager.url_to_connect, 50000, SynoLoader_DownloadManager.username, SynoLoader_DownloadManager.password);
                    break;
            }
        };

        this.connect_to_nas = function () {
            SynoLoader_DownloadManager.connecting = true;
            SynoLoader_DownloadManager.convert_old_url(SynoLoader_DownloadManager.preferences.getCharPref('url'));
            var protocol = SynoLoader_DownloadManager.preferences.getCharPref('protocol');
            var port = SynoLoader_DownloadManager.preferences.getCharPref('port');
            var host = SynoLoader_DownloadManager.preferences.getCharPref('host');
            var quick_connect = SynoLoader_DownloadManager.QuickConnect(
                quickConnectRelayTimeOutInMs,
                quickConnectLocalTimeOutInMs,
                protocol + '://',
                port
            );
            SynoLoader_DownloadManager.url_to_connect = protocol + '://';
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
                    SynoLoader_DownloadManager.is_connect = response.success;
                    SynoLoader_DownloadManager.connecting = false;
                });
            });
        };

        this.transfer_to_nas = function (link) {
            if (link.toLowerCase().endsWith('.torrent') && SynoLoader_DownloadManager.protocol.version > 0) {
                var file = Cc['@mozilla.org/file/directory_service;1']
                    .getService(Ci.nsIProperties)
                    .get('TmpD', Ci.nsIFile);
                var uuidGenerator = Cc['@mozilla.org/uuid-generator;1']
                    .getService(Ci.nsIUUIDGenerator);
                var uuid = uuidGenerator.generateUUID();
                var uuidString = uuid.toString();
                uuidString = uuidString.replace('{', '').replace('}', '');
                file.append('synoloader' + uuidString + '.torrent');
                file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0666);
                SynoLoader_DownloadManager.FileDownloaderHandler.get_file_content(
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
                SynoLoader_DownloadManager.protocol.task_action(
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
            SynoLoader_DownloadManager.Util.log('delete_all');
            SynoLoader_DownloadManager.load_download_list(
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
            SynoLoader_DownloadManager.protocol.task_action(
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
            return SynoLoader_DownloadManager.list;
        };

        this.observe = function (subject, topic, data) {
            if (topic === 'nsPref:changed') {
                switch (data) {
                    case 'show_not':
                        SynoLoader_DownloadManager.Notification.show_not = SynoLoader_DownloadManager.preferences.getBoolPref('show_not');
                        break;
                    case 'show_dbg':
                        SynoLoader_DownloadManager.Util.show_log = SynoLoader_DownloadManager.preferences.getBoolPref('show_dbg');
                        break;
                    case 'use_magnet':
                        SynoLoader_DownloadManager.MagnetHandler.set_active(SynoLoader_DownloadManager.preferences.getBoolPref('use_magnet'));
                        break;
                }
            }
        };

        this.httpResponseObserver = SynoLoader_DownloadManager.MagnetHandler.createObserver();
        this.httpResponseObserver.observe = function (aSubject, aTopic, aData) {
            SynoLoader_DownloadManager.Util.log('observer');
            if (aTopic === 'magnet-on-open-uri') {
                var aURI = aSubject.QueryInterface(Ci.nsIURI);
                if (!aURI) return;
                var uriText = aURI.spec;
                SynoLoader_DownloadManager.transfer_to_nas(uriText);
            }
        };

        this.observerService = Cc['@mozilla.org/observer-service;1']
            .getService(Ci.nsIObserverService);

        this.observerService.addObserver(SynoLoader_DownloadManager.httpResponseObserver, 'magnet-on-open-uri', false);

    }).apply(SynoLoader_DownloadManager);
}
