var SynoLoader = {};
Components.utils.import("resource://SynoLoader/DSM3.js", SynoLoader);


(function() {


    this.firstRun = function(extensions) {
        var firstRunPref = "extensions.SynoLoader.firstRunDone";

        if (!Application.prefs.getValue(firstRunPref, false)) {
            Application.prefs.setValue(firstRunPref, true);
            var toolbar = document.getElementById("nav-bar");
            var before = null;
            toolbar.insertItem("synoloader_toolbar_id", before);
            toolbar.setAttribute("currentset", toolbar.currentSet);
            document.persist(toolbar.id, "currentset");
        }
    };



    this.UpdateListPanel = function() {
        var mediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
            .getService(Components.interfaces.nsIWindowMediator);
        var document = mediator.getMostRecentWindow("navigator:browser").document;
        var list = document.getElementById('synoloader_toolbar_panel_list_id');
        var panel = document.getElementById('synoloader_toolbar_panel_id');
        var title = document.getElementById('synoloader_toolbar_label_id');

        if (title && title.getAttribute('value') == "No Connection, please set correct Preferces") {
            panel.removeChild(panel.firstChild);
            title.setAttribute('value', "Loading...");
            panel.appendChild(title);
        }
        SynoLoader.SynoLoaderDMS.syno_download_station.protocoll.task_action(function(response) {
                if (response.success === true) {
                    var loaded_list = SynoLoader.SynoLoaderDMS.syno_download_station.protocoll.calcItems(response.items);
                    if (title) {
                        panel.removeChild(title);
                    }
                    if (!list) {
                        panel.removeChild(panel.firstChild);
                        panel.appendChild(list);
                        list.setAttribute("id", "synoloader_toolbar_panel_list_id");

                    }
                    var count = list.itemCount;
                    while (count-- > 0) {
                        list.removeItemAt(count);
                    }

                    for (var i in loaded_list) {
                        list.appendChild(loaded_list[i]);
                    }

                    if (list.itemCount === 0) {
                        panel.removeChild(panel.firstChild);
                        title.setAttribute('value', "No active Downloads");
                        title.setAttribute('id', "synoloader_toolbar_label_id");
                        panel.appendChild(title);
                    }

                }


            },
            'getall');

        panel.moveTo(-1, -1);
    };

    this.onLoad = function() {

        this.strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
        var mediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
            .getService(Components.interfaces.nsIWindowMediator);
        var doc = mediator.getMostRecentWindow("navigator:browser").document;
        if (SynoLoader.SynoLoaderDMS.syno_download_station.initialized === false) {
            this.SynoLoaderDMS.syno_download_station.initialized = true;
            if (Application.extensions) {
                this.firstRun(Application.extensions);
            } else {
                Application.getExtensions(this.firstRun);
            }


            document.getElementById("contentAreaContextMenu")
                .addEventListener("popupshowing", function(e) {
                    SynoLoader.showFirefoxContextMenu(e);
                }, false);

            // initialization code
            this.strings = doc.getElementById("SynoLoader-strings");

            this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefService)
                .getBranch("extensions.SynoLoader.");

            this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefService)
                .getBranch("extensions.SynoLoader.");

            this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
            this.prefs.addObserver("", this, false);

            var myLoginManager = Components.classes["@mozilla.org/login-manager;1"].
            getService(Components.interfaces.nsILoginManager);

            // Find users for the given parameters
            var logins = myLoginManager.findLogins({}, 'chrome://SynoLoader.Pass', null, 'User Registration');
            if (logins.length > 0) {
                this.SynoLoaderDMS.syno_download_station.username = logins[0].username;
                this.SynoLoaderDMS.syno_download_station.password = logins[0].password;
            }



            this.SynoLoaderDMS.syno_download_station.set_protocol(this.prefs.getCharPref('DSM_Verison'));
            this.SynoLoaderDMS.syno_download_station.window = window;
            this.SynoLoaderDMS.Notification.show_not = this.prefs.getBoolPref('show_not');
            this.SynoLoaderDMS.Util.show_log = this.prefs.getBoolPref('show_dgb');
            this.SynoLoaderDMS.syno_download_station.url = this.prefs.getCharPref('url');
            this.SynoLoaderDMS.syno_download_station.connect_to_nas("");


        }
    };


    this.observe = function(subject, topic, data) {
        if (topic == "nsPref:changed") {
            switch (data) {
                case 'url':
                    this.SynoLoaderDMS.syno_download_station.url = this.prefs.getCharPref('url');
                    this.SynoLoaderDMS.syno_download_station.connect_to_nas("");
                    break;
                case 'show_not':
                    this.SynoLoaderDMS.Notification.show_not = this.prefs.getBoolPref('show_not');
                    break;
                case 'show_dgb':
                    this.SynoLoaderDMS.Util.show_log = this.prefs.getBoolPref('show_dgb');
                    break;
                case 'DSM_Verison':
                    this.SynoLoaderDMS.syno_download_station.DSMVerison = this.prefs.getCharPref('DSM_Verison');
                    this.SynoLoaderDMS.syno_download_station.connect_to_nas("");
                    break;
            }
        }
    };


    this.onMenuItemLinkCommand = function(event) {
        if (SynoLoader.SynoLoaderDMS.syno_download_station.is_connect === true) {
            window.open(this.SynoLoaderDMS.syno_download_station.url + "/webman/index.cgi?launchApp=SYNO.SDS.DownloadStation.Application", "Diskstation", SynoLoader.strWindowFeatures);
        } else {
            this.SynoLoaderDMS.Notification.show("No Connection");
        }

    };

    this.onMenuItemCommand = function(event) {
        if (SynoLoader.SynoLoaderDMS.syno_download_station.is_connect === true) {
            this.SynoLoaderDMS.syno_download_station.transfer_to_nas(gContextMenu.linkURL);
        } else {
            this.SynoLoaderDMS.Notification.show("No Connection");
        }

    };


    this.onToolBarDownloadInfo = function(event) {

        var doUpdate = false;
        var mediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
            .getService(Components.interfaces.nsIWindowMediator);
        var document = mediator.getMostRecentWindow("navigator:browser").document;
        var list = document.getElementById('synoloader_toolbar_panel_list_id');
        var panel = document.getElementById('synoloader_toolbar_panel_id');
        var title = document.getElementById('synoloader_toolbar_label_id');

        if (SynoLoader.SynoLoaderDMS.syno_download_station.is_connect === false) {

            SynoLoader.SynoLoaderDMS.syno_download_station.protocoll.conect(function(response) {
                if (!response.success) {
                    panel.removeChild(panel.firstChild);
                    var title = document.createElement('label');
                    title.setAttribute('value', "No Connection, please set correct Preferces");
                    title.addEventListener("click", function() {
                        window.openDialog("chrome://SynoLoader/content/options.xul", "modifyheadersDialog", "resizable,dialog,centerscreen,modal", this);
                    }, false);
                    title.setAttribute('class', "text-link");
                    title.setAttribute('id', "synoloader_toolbar_label_id");
                    panel.appendChild(title);
                } else {
                    doUpdate = true;
                }

            });


        } else {
            doUpdate = true;
        }

        if (doUpdate) {
            SynoLoader.UpdateListPanel();
            SynoLoader.UpdateListPanelInterval = setInterval(function() {
                SynoLoader.UpdateListPanel();
            }, 1000);
        }

    };


    this.onToolBarDownloadInfoHidden = function(event) {
        clearInterval(SynoLoader.UpdateListPanelInterval);
    };


    this.onMenuItemDownloads = function(event) {

        window.open("chrome://SynoLoader/content/SynoDownloads.xul", "SynoLoader Downloads", "chrome,centerscreen,width=500,height=600");
    };

    this.showFirefoxContextMenu = function(event) {
        // show or hide the menuitem based on what the context menu is on
        document.getElementById("context-SynoLoader").hidden = (!gContextMenu.onLink);

    };



    this.onToolbarButtonCommand = function(e) {
        // just reuse the function above.  you can change this, obviously!
        this.onMenuItemCommand(e);
    };


    window.addEventListener("load", function(e) {
        SynoLoader.onLoad();
    }, false);

}).apply(SynoLoader);
