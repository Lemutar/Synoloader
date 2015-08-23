var EXPORTED_SYMBOLS = ["Protocol"];
let { classes: Cc, interfaces: Ci } = Components;

Components.utils.import("resource://SynoLoader/Request.js");
Components.utils.import("resource://SynoLoader/Util.js");

var Protocol = function(baseURL, timeout, username, password) {
    var return_protocol = function() {};
    return_protocol.connectionID = "";
    return_protocol.baseURL = baseURL;


    return_protocol.version = 0;
    return_protocol.connectTime = 0;
    return_protocol.ed2kDownloadFolder = "home";
    return_protocol.password = password;
    return_protocol.username = username;
    return_protocol.connect = function(callback) {
        var connect_response = {
            success: false,
            id: "",
            error_text: ''
        };
        var connect_request = Request(return_protocol.baseURL + '/download/download_redirector.cgi',
            'action=login&username=' + encodeURIComponent(return_protocol.username) + '&passwd=' + encodeURIComponent(return_protocol.password),
            timeout,
            function(response) {
                if (response.status != 200) {
                    connect_response.error_text = response.statusText;
                } else {
                    Util.log(response.text);
                    if (response.json.success === true) {
                        if (response.json.login_success === true) {
                            connect_response.id = response.json.id;
                            connect_response.success = true;
                            return_protocol.connectionID = response.json.id;
                            return_protocol.connectTime = Date.now();
                        } else {
                            connect_response.success = false;
                            switch (response.json.errcode) {
                                case -2:
                                    connect_response.error_text = "wrong password";
                                    break;
                                case -5:
                                    connect_response.error_text = "unknown user";
                                    break;
                            }
                        }


                    }
                }
                callback(connect_response);
            });
        Util.log("try to connect to : " + return_protocol.baseURL);
        connect_request.post();

    };


    return_protocol.task_action = function(callback, task_action, parameter) {
        var task_action_response = {
            success: false,
            data: [],
            error_text: ''
        };
        if (Date.now() - return_protocol.connectTime > 1000 * 60 * 20) {
            return_protocol.connect(function(connect_response) {
                if (connect_response.success === true) {
                    return_protocol.task_action(callback, task_action, parameter);
                } else {
                    callback(connect_response);
                }
            });
        } else {
            switch (task_action) {
                case 'getall':
                    var task_action_request = Request(return_protocol.baseURL + '/download/download_redirector.cgi',
                        'action=getall&id=' + return_protocol.connectionID,
                        timeout,
                        function(response) {
                            if (response.status != 200) {
                                task_action_response.error_text = response.statusText;
                            } else {
                                Util.log(response.text);
                                task_action_response.success = response.json.success;
                                task_action_response.items = response.json.items;
                            }
                            callback(task_action_response);
                        });
                    Util.log("try to getall to : " + return_protocol.baseURL);
                    task_action_request.post();

                    break;

                case 'addurl':
                    task_action_request = Request(return_protocol.baseURL + '/download/download_redirector.cgi',
                        'action=' + task_action + '&id=' + return_protocol.connectionID + '&url=' + encodeURIComponent(parameter),
                        timeout,
                        function(response) {
                            if (response.status != 200) {
                                task_action_response.error_text = response.statusText;
                            } else {
                                Util.log(response.text);
                                task_action_response.success = response.json.success;
                            }
                            callback(task_action_response);

                        });
                    Util.log("try to addurl to : " + return_protocol.baseURL);
                    task_action_request.post();


                    break;

                case 'delete':
                case 'resume':
                case 'stop':
                    task_action_request = Request(return_protocol.baseURL + '/download/download_redirector.cgi',
                        'action=' + task_action + '&idList=' + parameter + '&id=' + return_protocol.connectionID,
                        timeout,
                        function(response) {
                            if (response.status != 200) {
                                task_action_response.error_text = response.statusText;
                            } else {
                                Util.log(response.text);
                                task_action_response.success = response.json.success;
                            }
                            callback(task_action_response);
                        });
                    Util.log("try to " + task_action + " to : " + return_protocol.baseURL);
                    task_action_request.post();
                    break;

            }
        }



        return_protocol.OnStart = function(event) {
            if (event.target.status == 3) {
                return_protocol.task_action(function() {}, 'resume', event.target.id.replace("syno-start", ""));
            } else {
                return_protocol.task_action(function() {}, 'stop', event.target.id.replace("syno-start", ""));
            }
        };

        return_protocol.OnDel = function(event) {
            return_protocol.task_action(function() {}, 'delete', event.target.id.replace("syno-del", ""));
        };


        return_protocol.calcItems = function(items) {
            mediator = Cc['@mozilla.org/appshell/window-mediator;1']
                .getService(Ci.nsIWindowMediator);
            document = mediator.getMostRecentWindow("navigator:browser").document;
            var richlistitems = [];
            var background_color_toggel = false;
            items.forEach(function(item) {
                var richlistitem = document.createElement('richlistitem');
                richlistitem.download_task_id = item.id;
                var vbox = document.createElement('vbox');
                var hbox = document.createElement('hbox');
                var title = document.createElement('label');
                var progressmeter = document.createElement('progressmeter');
                var label = document.createElement('label');
                var start = document.createElement('toolbarbutton');
                var del = document.createElement('toolbarbutton');

                start.setAttribute('id', "syno-start" + item.id);
                start.setAttribute('class', "sl-item-start");
                start.setAttribute('autocheck', "false");

                start.status = item.status;
                start.addEventListener('command', return_protocol.OnStart, true);
                if (item.status == 3) {
                    start.setAttribute('style', "list-style-image: url('chrome://SynoLoader/skin/Play.png')");
                } else {
                    start.setAttribute('style', "list-style-image: url('chrome://SynoLoader/skin/Pause.png')");
                }
                del.setAttribute('autocheck', "false");
                del.setAttribute('id', "syno-del" + item.id);
                del.setAttribute('class', "sl-item-del");
                del.setAttribute("style", "list-style-image: url('chrome://SynoLoader/skin/Stop.png')");
                del.addEventListener('command', return_protocol.OnDel, true);

                progressmeter.setAttribute('value', item.progress.replace("%", ""));
                progressmeter.setAttribute('class', "sl-item-progress");
                progressmeter.setAttribute('id', "syno-progress" + item.id);
                progressmeter.setAttribute('flex', '1');
                title.setAttribute('id', "syno-title" + item.id);
                title.setAttribute('value', item.filename);
                title.setAttribute('crop', "center");
                title.setAttribute('class', "sl-item-title");

                status = "none";
                switch (item.status) {
                    case 1:
                        status = "waiting";
                        break;
                    case 2:
                        status = "downloading";
                        break;
                    case 3:
                        status = "paused";
                        break;
                    case 5:
                        status = "finished";
                        break;
                }
                label.setAttribute('value', status + " - " + item.currentSize + " of " + item.totalSize + " - " + item.progress);
                label.setAttribute('id', "syno-label" + item.id);
                label.setAttribute('crop', "center");


                hbox.setAttribute('class', "sl-item-hbox");
                hbox.setAttribute('flex', '1');
                vbox.setAttribute('flex', '1');
                vbox.appendChild(title);

                hbox.appendChild(progressmeter);
                hbox.appendChild(start);
                hbox.appendChild(del);
                vbox.appendChild(hbox);
                vbox.appendChild(label);

                richlistitem.setAttribute('id', "syno-" + item.id);
                richlistitem.setAttribute('syno-id', item.id);
                richlistitem.setAttribute('class', "SynoLoader_Item");
                richlistitem.appendChild(vbox);

                if (background_color_toggel) {
                    richlistitem.setAttribute('style', "background-color:#F0F0F0;");
                    background_color_toggel = false;
                } else {
                    richlistitem.setAttribute('style', "");
                    background_color_toggel = true;
                }


                richlistitems.push(richlistitem);
            });
            return richlistitems;
        };



    };

    return return_protocol;
};
