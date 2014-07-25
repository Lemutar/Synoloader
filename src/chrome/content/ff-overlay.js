var SynoLoader = {};
Components.utils.import("resource://SynoLoader/DownloadManager.js", SynoLoader);


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
        
        SynoLoader.SynoLoader_DownloadManager.load_download_list(function (items) {          
            items.forEach(function(item) {
                    var panel = document.getElementById('synoloader_toolbar_panel_id');
                    var list = document.getElementById('synoloader_toolbar_panel_list_id');
                    var loaded_list = SynoLoader.SynoLoader_DownloadManager.protocol.calcItems(items);
                    var title = document.getElementById('synoloader_toolbar_label_id');
                    if (title) {
                        panel.removeChild(title);
                    }
                    if (!list) {
                        panel.removeChild(panel.firstChild);
                        var list = document.createElement('richlistbox');
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

            });        

        });

        panel.moveTo(-1, -1);
    };

    this.onLoad = function() {

            if (Application.extensions) {
                this.firstRun(Application.extensions);
            } else {
                Application.getExtensions(this.firstRun);
            }


            document.getElementById("contentAreaContextMenu")
                .addEventListener("popupshowing", function(e) {
                    SynoLoader.showFirefoxContextMenu(e);
                }, false);

        
    };





    this.onMenuItemLinkCommand = function(event) {
        if (SynoLoader.SynoLoader_DownloadManager.is_connect === true) {
            window.open(SynoLoader.SynoLoader_DownloadManager.url + "/webman/index.cgi?launchApp=SYNO.SDS.DownloadStation.Application", "Diskstation", SynoLoader.strWindowFeatures);
        } else {
            this.SynoLoader_DownloadManager.Notification.show("No Connection");
        }

    };

    this.onMenuItemCommand = function(event) {
        if (SynoLoader.SynoLoader_DownloadManager.is_connect === true) {
            SynoLoader.SynoLoader_DownloadManager.transfer_to_nas(gContextMenu.linkURL);
        } else {
            SynoLoader.SynoLoader_DownloadManager.Notification.show("No Connection");
        }

    };


    this.onToolBarDownloadInfo = function(event) {

        this.doUpdate = false;
        var mediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
            .getService(Components.interfaces.nsIWindowMediator);
        var document = mediator.getMostRecentWindow("navigator:browser").document;
        var list = document.getElementById('synoloader_toolbar_panel_list_id');
        var panel = document.getElementById('synoloader_toolbar_panel_id');
        var title = document.getElementById('synoloader_toolbar_label_id');
        /*
        if (SynoLoader.SynoLoader_DownloadManager.is_connect === false) {

            SynoLoader.SynoLoader_DownloadManager..protocoll.conect(function(response) {
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

        */

        this.doUpdate = true;


        if (this.doUpdate) {
            SynoLoader.UpdateListPanel();
            SynoLoader.UpdateListPanelInterval = setInterval(function() {
                SynoLoader.UpdateListPanel();
            }, 1000);
        }

    };


    this.onToolBarDownloadInfoHidden = function(event) {
        
        clearInterval(SynoLoader.UpdateListPanelInterval);
        
    };
    
    this.onToolbarButtonCommand = function(e) {
        
        this.onMenuItemCommand(e);
        
    };


    this.showFirefoxContextMenu = function(event) {
 
        document.getElementById("context-SynoLoader").hidden = (!gContextMenu.onLink);

    };





    window.addEventListener("load", function(e) {
        SynoLoader.onLoad();
    }, false);

}).apply(SynoLoader);
