const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (typeof SL_Overlay === "undefined") {
    var SL_Overlay = {};

    Cu.import("resource://SynoLoader/DownloadManager.js", SL_Overlay);
    Cu.import("resource://SynoLoader/Util.js", SL_Overlay);

    (function () {
        this.firstRun = (extensions) => {
            let firstRunPref = "extensions.SynoLoader.firstRunDone";

            if (!Application.prefs.getValue(firstRunPref, false)) {
                Application.prefs.setValue(firstRunPref, true);

                let toolbar = document.getElementById("nav-bar");
                toolbar.insertItem("synoloader-toolbar-id", null);
                toolbar.setAttribute("currentset", toolbar.currentSet);
                document.persist(toolbar.id, "currentset");
            }
        };

        this.UpdateListPanel = () => {
            let title = document.getElementById('synoloader_toolbar_panel_lable_id');
            if (title.getAttribute("value") != "Loading...") {
                title.setAttribute('value', "Loading...");
            }

            this.SL_DownloadManager.load_download_list(
                (items) => {
                    let panel = document.getElementById('synoloader_toolbar_panel_id');
                    let list = document.getElementById('synoloader_toolbar_panel_list_id');
                    let hbox_lable = document.getElementById('synoloader_toolbar_panel_box_lable_id');
                    let loaded_list = {};

                    if (typeof SL_Overlay.SL_DownloadManager.protocol != "undefined") {
                        loaded_list = SL_Overlay.SL_DownloadManager.protocol.calcItems(items);
                    }

                    let count = list.itemCount;
                    while (count-- > 0) {
                        list.removeItemAt(count);
                    }

                    for (let i in loaded_list) {
                        list.appendChild(loaded_list[i]);
                    }

                    if (loaded_list.length === 0) {
                        hbox_lable.setAttribute('hidden', "false");
                        let title = document.getElementById('synoloader_toolbar_panel_lable_id');
                        title.setAttribute('value', "No active Downloads");
                        clearInterval(SL_Overlay.UpdateListPanelInterval);
                    } else {
                        hbox_lable.setAttribute('hidden', "true");
                    }
                    list.removeItemFromSelection(0);
                    panel.moveTo(-1, -1);

                },
                (response) => {
                    let hbox_lable = document.getElementById('synoloader_toolbar_panel_box_lable_id');
                    hbox_lable.setAttribute('hidden', "false");
                    let panel = document.getElementById('synoloader_toolbar_panel_id');
                    let title = document.getElementById('synoloader_toolbar_panel_lable_id');
                    title.setAttribute('value', "No Connection, please set correct Preferces");
                    clearInterval(SL_Overlay.UpdateListPanelInterval);
                    panel.moveTo(-1, -1);
                }
            );
        };

        this.showOptions = () => {
            window.open("chrome://SynoLoader/content/options.xul", "Preferences", "chrome=yes,toolbar=yes");
        };

        this.onLoad = () => {
            this.Util.log("SL_Overlay loaded");
            if (Application.extensions) {
                this.firstRun(Application.extensions);
            } else {
                Application.getExtensions(this.firstRun);
            }

            document.getElementById("contentAreaContextMenu")
                .addEventListener("popupshowing", (event) => {
                    SL_Overlay.showFirefoxContextMenu(event);
                }, false);
            this.SL_DownloadManager.connectToNas();
        };

        this.onMenuItemLinkCommand = (event) => {
            if (this.SL_DownloadManager.isConnected) {
                window.open(this.SL_DownloadManager.url + "/webman/index.cgi?launchApp=SYNO.SDS.DownloadStation.Application", "Diskstation", SL_Overlay.strWindowFeatures);
            } else {
                this.SL_DownloadManager.Notification.show("No Connection");
            }
        };

        this.onMenuItemCommand = (event) => {
            if (this.SL_DownloadManager.isConnected) {
                this.SL_DownloadManager.transferToNas(gContextMenu.linkURL);
            } else {
                this.SL_DownloadManager.Notification.show("No Connection");
            }
        };

        this.onToolBarDownloadInfo = (event) => {
            this.UpdateListPanel();
            this.UpdateListPanelInterval = setInterval(() => {
                SL_Overlay.UpdateListPanel();
            }, 1000);
        };

        this.onToolBarDownloadInfoHidden = (event) => {
            clearInterval(this.UpdateListPanelInterval);
        };

        this.onToolbarButtonCommand = (event) => {
            this.onMenuItemCommand(event);
        };

        this.showFirefoxContextMenu = (event) => {
            document.getElementById("synoloader_context").hidden = (!gContextMenu.onLink);
        };

    }).apply(SL_Overlay);

    window.addEventListener("load", load = (event) => {
        window.removeEventListener("load", load, false); //remove listener, no longer needed
        SL_Overlay.onLoad();
    }, false);
}
