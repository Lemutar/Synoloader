var EXPORTED_SYMBOLS = ["Protocol"];
Components.utils.import("resource://SynoLoader/Request.js");
Components.utils.import("resource://SynoLoader/Util.js");



function set_auth_api_error_text(error_code, response) {
    set_common_error_text(error_code, response);
    switch (error_code) {
        case 400:
            response.error_text = "No such account or incorrect password";
            break;
        case 401:
            response.error_text = "Account disabled";
            break;
        case 402:
            response.error_text = "Permission denied";
            break;
        case 403:
            response.error_text = "2-step verification code required";
            break;
        case 404:
            response.error_text = "Failed to authenticate 2-step verification code";
            break;
    }
}


function set_download_api_error_text(error_code, response) {
    set_common_error_text(error_code, response);
    switch (error_code) {
        case 400:
            response.error_text = "File upload failed";
            break;
        case 401:
            response.error_text = "Max number of tasks reached";
            break;
        case 402:
            response.error_text = "Destination denied";
            break;
        case 403:
            response.error_text = "Destination does not exist";
            break;
        case 404:
            response.error_text = "Invalid task id";
            break;
        case 405:
            response.error_text = "Invalid task action";
            break;
        case 406:
            response.error_text = "No default destination";
            break;
    }
}

function set_common_error_text(error_code, response) {
    switch (error_code) {
        case 100:
            response.error_text = "Unknown error";
            break;
        case 101:
            response.error_text = "Invalid parameter";
            break;
        case 102:
            response.error_text = "The requested API does not exist";
            break;
        case 103:
            response.error_text = "The requested method does not exist";
            break;
        case 104:
            response.error_text = "The requested version does not support the functionality";
            break;
        case 105:
            response.error_text = "The logged in session does not have permission";
            break;
        case 106:
            response.error_text = "Session timeout";
            break;
        case 107:
            response.error_text = "Session interrupted by duplicate login";
            break;
    }
}


var Protocol = function(base_url, timeout, user_name, password) {
    var return_protocol = function() {};
    return_protocol.connect_id = "";
    return_protocol.base_url = base_url;

    return_protocol.version = 1;

    return_protocol.Connect_Time = 0;
    return_protocol.ed2k_download_folder = "home";
    return_protocol.password = password;
    return_protocol.username = user_name;
    return_protocol.conect = function(callback) {
        var conect_response = {
            success: false,
            id: "",
            error_text: ''
        };
        var conect_request = Request(return_protocol.base_url + '/webapi/auth.cgi',
            "api=SYNO.API.Auth&version=2&method=login&account=" + encodeURIComponent(return_protocol.username) + "&passwd=" + encodeURIComponent(return_protocol.password) + "&session=DownloadStation&format=sid",
            timeout,
            function(response) {
                if (response.status != 200) {
                    conect_response.error_text = response.statusText;
                } else {
                    Util.log(response.text);

                    if (response.json.success === true) {
                        conect_response.id = response.json.data.sid;
                        conect_response.success = true;
                        return_protocol.connect_id = response.json.data.sid;
                        return_protocol.Connect_Time = Date.now();
                    } else {
                        set_auth_api_error_text(response.json.error.code, conect_response);
                    }

                }
                callback(conect_response);
            });
        Util.log("try to conect to : " + return_protocol.base_url);
        conect_request.get();

    };


    return_protocol.task_action = function(callback, task_action, parameter) {
        var task_action_response = {
            success: false,
            data: [],
            error_text: ''
        };
        if (Date.now() - return_protocol.Connect_Time > 1000 * 60 * 20) {
            return_protocol.conect(function(conect_response) {
                if (conect_response.success === true) {
                    return_protocol.task_action(callback, task_action, parameter);
                } else {
                    callback(conect_response);
                }
            });
        } else {
            switch (task_action) {
                case 'getall':
                    var task_action_request = Request(return_protocol.base_url + '/webapi/DownloadStation/task.cgi',
                        'api=SYNO.DownloadStation.Task&version=1&method=list&additional=detail,transfer&_sid=' + encodeURIComponent(return_protocol.connect_id),
                        timeout,
                        function(response) {
                            if (response.status != 200) {
                                task_action_response.error_text = response.statusText;
                            } else {

                                if (response.json.success === false) {
                                    set_download_api_error_text(response.json.error.code, task_action_response);
                                }

                                Util.log(response.text);
                                task_action_response.success = response.json.success;
                                task_action_response.items = response.json.data.tasks;
                            }
                            callback(task_action_response);
                        });
                    Util.log("try to getall to : " + return_protocol.base_url);
                    task_action_request.get();

                    break;

                case 'addurl':
                    task_action_request = Request(return_protocol.base_url + '/webapi/DownloadStation/task.cgi',
                        'api=SYNO.DownloadStation.Task&version=1&method=create&uri=' + encodeURIComponent(parameter) +
                        '&_sid=' + encodeURIComponent(return_protocol.connect_id),
                        timeout,
                        function(response) {
                            if (response.status != 200) {
                                task_action_response.error_text = response.statusText;
                            } else {
                                if (response.json.success === false) {
                                    set_download_api_error_text(response.json.error.code, task_action_response);
                                }
                                Util.log(response.text);
                                task_action_response.success = response.json.success;
                            }
                            callback(task_action_response);

                        });
                    Util.log("try to addurl to : " + return_protocol.base_url);
                    task_action_request.post();
                    break;

                case 'add_file':
                    Util.log("try to add file to " + parameter);

                    var formData = Components.classes["@mozilla.org/files/formdata;1"].createInstance(Components.interfaces.nsIDOMFormData);
                    formData.append("api", "SYNO.DownloadStation.Task");
                    formData.append("version", "1");
                    formData.append("method", "create");
                    formData.append("file", File(parameter));
                    formData.append("sid", encodeURIComponent(return_protocol.connect_id));

                    task_action_request = Request(return_protocol.base_url + '/webapi/DownloadStation/task.cgi',
                        formData,
                        timeout,
                        function(response) {
                            if (response.status != 200) {
                                task_action_response.error_text = response.statusText;
                            } else {
                                if (response.json.success === false) {
                                    set_download_api_error_text(response.json.error.code, task_action_response);
                                }
                                Util.log(response.text);
                                task_action_response.success = response.json.success;
                            }
                            callback(task_action_response);

                        });

                    task_action_request.post();
                    break;

                case 'delete':
                    task_action_request = Request(return_protocol.base_url + '/webapi/DownloadStation/task.cgi',
                        'api=SYNO.DownloadStation.Task&version=1&method=delete&id=' + encodeURIComponent(parameter) +
                        '&force_complete=false&_sid=' + encodeURIComponent(return_protocol.connect_id),
                        timeout,
                        function(response) {
                            if (response.status != 200) {
                                task_action_response.error_text = response.statusText;
                            } else {
                                if (response.json.success === false) {
                                    set_download_api_error_text(response.json.error.code, task_action_response);
                                }
                                Util.log(response.text);
                                task_action_response.success = response.json.success;
                            }
                            callback(task_action_response);
                        });
                    Util.log("try to " + encodeURIComponent(parameter) + " to : " + return_protocol.base_url);
                    task_action_request.get();
                    break;
                case 'resume':
                    task_action_request = Request(return_protocol.base_url + '/webapi/DownloadStation/task.cgi',
                        'api=SYNO.DownloadStation.Task&version=1&method=resume&id=' + encodeURIComponent(parameter) +
                        '&_sid=' + encodeURIComponent(return_protocol.connect_id),
                        timeout,
                        function(response) {
                            if (response.status != 200) {
                                task_action_response.error_text = response.statusText;
                            } else {
                                if (response.json.success === false) {
                                    set_download_api_error_text(response.json.error.code, task_action_response);
                                }
                                Util.log(response.text);
                                task_action_response.success = response.json.success;
                            }
                            callback(task_action_response);
                        });
                    Util.log("try to " + encodeURIComponent(parameter) + " to : " + return_protocol.base_url);
                    task_action_request.get();
                    break;
                case 'stop':
                    task_action_request = Request(return_protocol.base_url + '/webapi/DownloadStation/task.cgi',
                        'api=SYNO.DownloadStation.Task&version=1&method=pause&id=' + encodeURIComponent(parameter) +
                        '&_sid=' + encodeURIComponent(return_protocol.connect_id),
                        timeout,
                        function(response) {
                            if (response.status != 200) {
                                task_action_response.error_text = response.statusText;
                            } else {
                                if (response.json.success === false) {
                                    set_download_api_error_text(response.json.error.code, task_action_response);
                                }
                                Util.log(response.text);
                                task_action_response.success = response.json.success;
                            }
                            callback(task_action_response);
                        });
                    Util.log("try to " + encodeURIComponent(parameter) + " to : " + return_protocol.base_url);
                    task_action_request.get();
                    break;


            }
        }



        return_protocol.OnStart = function(event) {

            if (event.target.status == "paused") {
                return_protocol.task_action(function() {}, 'resume', event.target.id.replace("syno-start", ""));
            } else {
                return_protocol.task_action(function() {}, 'stop', event.target.id.replace("syno-start", ""));
            }
        };

        return_protocol.OnDel = function(event) {
            return_protocol.task_action(function() {}, 'delete', event.target.id.replace("syno-del", ""));
        };


        return_protocol.fileSizeSI = function(a, b, c, d, e) {
            return (b = Math, c = b.log, d = 1e3, e = c(a) / c(d) | 0, a / b.pow(d, e)).toFixed(2) + ' ' + (e ? 'kMGTPEZY' [--e] + 'B' : 'Bytes');
        };

        return_protocol.calcItems = function(items) {
            mediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
                .getService(Components.interfaces.nsIWindowMediator);
            document = mediator.getMostRecentWindow("navigator:browser").document;
            var richlistitems = [];
            var background_color_toggel = false;
            items.forEach(function(item) {
                var richlistitem = document.createElement('richlistitem');
                richlistitem.setAttribute('download_task_id', item.id);
                var vbox = document.createElement('vbox');
                var hbox = document.createElement('hbox');
                var title = document.createElement('label');
                var progressmeter = document.createElement('progressmeter');
                var label = document.createElement('label');
                var start = document.createElement('toolbarbutton');
                var del = document.createElement('toolbarbutton');

                start.setAttribute('id', "syno-start" + item.id);
                start.setAttribute('class', "SynoLoader_Item_start");
                start.setAttribute('autocheck', "false");

                start.status = item.status;
                start.addEventListener('command', return_protocol.OnStart, true);
                if (item.status == "paused") {
                    start.setAttribute('style', "list-style-image: url('chrome://SynoLoader/skin/Play.png')");
                } else {
                    start.setAttribute('style', "list-style-image: url('chrome://SynoLoader/skin/Pause.png')");
                }
                del.setAttribute('autocheck', "false");
                del.setAttribute('id', "syno-del" + item.id);
                del.setAttribute('class', "SynoLoader_Item_del");
                del.setAttribute("style", "list-style-image: url('chrome://SynoLoader/skin/Stop.png')");
                del.addEventListener('command', return_protocol.OnDel, true);

                item.progress = (item.additional.transfer.size_downloaded / item.size) * 100;
                progressmeter.setAttribute('value', item.progress);
                progressmeter.setAttribute('class', "SynoLoader_Item_progress");
                progressmeter.setAttribute('id', "syno-progress" + item.id);
                progressmeter.setAttribute('flex', '1');
                title.setAttribute('id', "syno-title" + item.id);
                title.setAttribute('value', item.title);
                title.setAttribute('crop', "center");
                title.setAttribute('class', "SynoLoader_Item_title");

                label.setAttribute('value', item.status + " - " + return_protocol.fileSizeSI(item.additional.transfer.size_downloaded) + " of " + return_protocol.fileSizeSI(item.size) + " - " + item.progress.toFixed(2) + "%");
                label.setAttribute('id', "syno-label" + item.id);
                label.setAttribute('crop', "center");


                hbox.setAttribute('class', "SynoLoader_Item_hbox");
                hbox.setAttribute('flex', '1');
                vbox.setAttribute('flex', '1');
                vbox.appendChild(title);

                hbox.appendChild(progressmeter);
                hbox.appendChild(start);
                hbox.appendChild(del);
                vbox.appendChild(hbox);
                vbox.appendChild(label);

                richlistitem.setAttribute('id', "syno-" + item.id);
                richlistitem.setAttribute('syono-id', item.id);
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
