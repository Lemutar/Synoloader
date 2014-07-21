var EXPORTED_SYMBOLS = ["SynoLoader_DownloadManager"];


if (typeof SynoLoader_DownloadManager == "undefined") {
    var SynoLoader_DownloadManager = {};



(function() {


    this.SynoId = 0;
    this.password = "";
    this.username = "";
    this.initialized = false;
    this.is_connect = false;
    this.connect_error = false;
    this.list = [];
    this.protocol = "undefined";
    

    this.url = "none";

    this.set_protocol = function(protocol) {
        switch (protocol) {
            case "1":
                SynoLoader_DownloadManager.Util.log("Set Protocol to < DMS 4.1");
                Components.utils.import("resource://SynoLoader/Protocol.js", SynoLoader_DownloadManager);
                this.protocol = SynoLoader_DownloadManager.Protocol(this.url, 5000, this.username, this.password);
                break;
            case "2":
                SynoLoader_DownloadManager.Util.log("Set Protocol to > DMS 4.1");
                Components.utils.import("resource://SynoLoader/Protocol_API.js", SynoLoader_DownloadManager);
                this.protocol = SynoLoader_DownloadManager.Protocol(this.url, 5000, this.username, this.password);
                break;
        }

    };


    this.connect_to_nas = function(link) {
        this.protocol.password = this.password;
        this.protocol.username = this.username;
        this.protocol.base_url = this.url;
        this.protocol.conect(function(response) {
            SynoLoader_DownloadManager.is_connect = response.success;
        });
    };

    this.transfer_to_nas = function(link) {
        if (link.toLowerCase().endsWith(".torrent") && SynoLoader_DownloadManager.protocol.version > 0 ) {
            var file = Components.classes["@mozilla.org/file/directory_service;1"]
                .getService(Components.interfaces.nsIProperties)
                .get("TmpD", Components.interfaces.nsIFile);
            var uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"]
                                .getService(Components.interfaces.nsIUUIDGenerator);
            var uuid = uuidGenerator.generateUUID();
            var uuidString = uuid.toString();
            uuidString = uuidString.replace('{','').replace('}','');
            file.append("synoloader"+uuidString+".torrent");
            file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
            SynoLoader_DownloadManager.FileDownloaderHandler.get_file_content(link,file.path,                                                          
                function()
                {
                SynoLoader_DownloadManager.protocol.task_action(function(response) {
                    if (response.success === true) {
                        SynoLoader_DownloadManager.Notification.show("Send Torent file to NAS", link);
                    } else {
                        SynoLoader_DownloadManager.Notification.show("Send link failed",response.error_text);
                    }
    
                },
                'add_file',
                file.path);
                });
        }
        else
        {
            this.protocol.task_action(function(response) {
                if (response.success === true) {
                    SynoLoader_DownloadManager.Notification.show("Send link", link);
                } else {
                    SynoLoader_DownloadManager.Notification.show("Send link failed",response.error_text);
                }

            },
            'addurl',
            link);
            
        }


    };

    this.delete_all = function(){
        SynoLoader_DownloadManager.Util.log("delete_all");
        SynoLoader_DownloadManager.load_download_list(function (items) {          
            items.forEach(function(item) {
                SynoLoader_DownloadManager.Util.log("delete " + item.id);
                SynoLoader_DownloadManager.protocol.task_action(function() {}, 'delete', item.id);
            });        
        
        });

    };

    this.load_download_list = function(manage_items) {
        this.protocol.task_action(function(response) {
                if (response.success === true) {
                    manage_items(response.items);
                } 

            },
            'getall');
    };


    this.get_list = function() {
        return this.list;
    };


}).apply(SynoLoader_DownloadManager);


Components.utils.import("resource://SynoLoader/FileDownloaderHandler.js", SynoLoader_DownloadManager);
Components.utils.import("resource://SynoLoader/Util.js", SynoLoader_DownloadManager);
Components.utils.import("resource://SynoLoader/Notification.js", SynoLoader_DownloadManager);

}
