var EXPORTED_SYMBOLS = ["Protocol"];
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://SynoLoader/Request.js");
Cu.import("resource://SynoLoader/Util.js");

try {
    Cu.importGlobalProperties(["File"]);
} catch (e) {
    Util.log("importGlobalProperties([\"File\"]) fail");
}

const apiErrorTexts = {
    common: {
        100: "Unknown error",
        101: "Invalid parameter",
        102: "The requested API does not exist",
        103: "The requested method does not exist",
        104: "The requested version does not support the functionality",
        105: "The logged in session does not have permission",
        106: "Session timeout",
        107: "Session interrupted by duplicate login"
    },
    auth: {
        400: "No such account or incorrect password",
        401: "Account disabled",
        402: "Permission denied",
        403: "2-step verification code required",
        404: "Failed to authenticate 2-step verification code"
    },
    download: {
        400: "File upload failed",
        401: "Max number of tasks reached",
        402: "Destination denied",
        403: "Destination does not exist",
        404: "Invalid task id",
        405: "Invalid task action",
        406: "No default destination"
    }
};

function set_common_error_text (error_code, response) {
    response.error_text = apiErrorTexts.common[error_code];
}

function set_auth_api_error_text (error_code, response) {
    set_common_error_text(error_code, response);
    response.error_text = apiErrorTexts.auth[error_code];
}

function set_download_api_error_text (error_code, response) {
    set_common_error_text(error_code, response);
    response.error_text = apiErrorTexts.download[error_code];
}

const apiEndpoints = {
    auth: "/webapi/auth.cgi",
    download: {
        task: "/webapi/DownloadStation/task.cgi"
    }
};


var Protocol = function (baseURL, timeout, username, password) {
    let connectionID = "",
        connectionIDEncoded = "";

    this.version = 1;
    this.ed2kDownloadFolder = "home";

    this.baseURL = baseURL;

    this.connectTime = 0;

    this.connect = (callback) => {
        Util.log("try to connect to : " + this.baseURL);

        let response = {
                success: false,
                id: "",
                error_text: ""
            };

        Request(this.baseURL + apiEndpoints.auth,
            "api=SYNO.API.Auth&version=2&method=login&account=" + encodeURIComponent(username) + "&passwd=" + encodeURIComponent(password) + "&session=DownloadStation&format=sid",
            timeout,
            (apiResponse) => {
                if (apiResponse.status === 200) {
                    Util.log(apiResponse.text);

                    if (apiResponse.json.success) {
                        response.success = true;
                        response.id = apiResponse.json.data.sid;
                        this.setConnectionID(apiResponse.json.data.sid);
                        this.connectTime = Date.now();
                    } else {
                        set_auth_api_error_text(apiResponse.json.error.code, response);
                    }
                } else {
                    response.error_text = apiResponse.statusText;
                }
                callback(response);
            }
        ).get();
    };

    this.setConnectionID = (id) => {
        connectionID = id;
        connectionIDEncoded = encodeURIComponent(id);
    };

    this.task_action = (callback, action, parameter) => {
        let response = {
                success: false,
                data: [],
                error_text: ""
            },
            parameterEncoded = encodeURIComponent(parameter);

        if (Date.now() - this.connectTime > 1000 * 60 * 20) {
            this.connect((connectResponse) => {
                if (connectResponse.success === true) {
                    this.task_action(callback, action, parameter);
                } else {
                    callback(connectResponse);
                }
            });
        } else {

            switch (action) {

                case "addurl":
                    Util.log("try to addurl to : " + this.baseURL);
                    Request(this.baseURL + apiEndpoints.download.task,
                        "api=SYNO.DownloadStation.Task&version=1&method=create&uri=" + parameterEncoded +
                        "&_sid=" + connectionIDEncoded,
                        timeout,
                        (apiResponse) => {
                            if (apiResponse.status != 200) {
                                response.error_text = apiResponse.statusText;
                            } else {
                                if (apiResponse.json.success === false) {
                                    set_download_api_error_text(apiResponse.json.error.code, response);
                                }
                                Util.log(apiResponse.text);
                                response.success = apiResponse.json.success;
                            }
                            callback(response);

                        }
                    ).post();
                    break;

                case "add_file":
                    Util.log("try to add file to " + parameter.path);

                    let formData = Cc["@mozilla.org/files/formdata;1"].
                                       createInstance(Ci.nsIDOMFormData);
                    formData.append("api", "SYNO.DownloadStation.Task");
                    formData.append("version", "1");
                    formData.append("method", "create");
                    formData.append("_sid", connectionIDEncoded);
                    formData.append("file", File(parameter.path));

                    Request(this.baseURL + apiEndpoints.download.task,
                        formData,
                        timeout,
                        (apiResponse) => {
                            if (apiResponse.status != 200) {
                                response.error_text = apiResponse.statusText;
                            } else {
                                if (apiResponse.json.success === false) {
                                    set_download_api_error_text(apiResponse.json.error.code, response);
                                }
                                Util.log(apiResponse.text);
                                response.success = apiResponse.json.success;
                            }
                            callback(response);

                        }
                    ).post();
                    break;

                case "getall":
                    Util.log("try to getall to : " + this.baseURL);
                    Request(this.baseURL + apiEndpoints.download.task,
                        "api=SYNO.DownloadStation.Task&version=1&method=list&additional=transfer&_sid=" + connectionIDEncoded,
                        timeout,
                        (apiResponse) => {
                            if (apiResponse.status != 200) {
                                response.error_text = apiResponse.statusText;
                            } else {

                                if (apiResponse.json.success === false) {
                                    set_download_api_error_text(apiResponse.json.error.code, response);
                                }

                                Util.log(apiResponse.text);
                                response.success = apiResponse.json.success;
                                response.items = apiResponse.json.data.tasks;
                            }
                            callback(response);
                        }
                    ).get();
                    break;

                case "resume":
                case "pause":
                case "delete":
                    Util.log("try to " + action + " " + parameterEncoded + " to : " + this.baseURL);

                    let param = "api=SYNO.DownloadStation.Task&version=1" +
                                "&_sid=" + connectionIDEncoded +
                                "&id=" + parameterEncoded +
                                "&method=" + encodeURIComponent(action);
                    if (action === "delete") {
                        param += "&force_complete=false";
                    }

                    Request(this.baseURL + apiEndpoints.download.task,
                        param,
                        timeout,
                        (apiResponse) => {
                            if (apiResponse.status === 200) {
                                if (apiResponse.json.success === false) {
                                    set_download_api_error_text(apiResponse.json.error.code, response);
                                }
                                Util.log(apiResponse.text);
                                response.success = apiResponse.json.success;
                            } else {
                                response.error_text = apiResponse.statusText;
                            }
                            callback(response);
                        }
                    ).get();
                    break;
            }
        }
    };

    this.onStart = (event) => {
        if (event.target.status === "paused") {
            this.task_action(() => {}, "resume", event.target.id.replace("syno-start", ""));
        } else {
            this.task_action(() => {}, "pause", event.target.id.replace("syno-start", ""));
        }
    };

    this.onDelete = (event) => {
        this.task_action(() => {}, "delete", event.target.id.replace("syno-del", ""));
    };

    this.fileSizeSI = (a, b, c, d, e) => {
        return (b = Math, c = b.log, d = 1e3, e = c(a) / c(d) | 0, a / b.pow(d, e)).toFixed(2) + " " + (e ? "kMGTPEZY" [--e] + "B" : "Bytes");
    };

    this.calcItems = (items) => {
        let doc = Cc["@mozilla.org/appshell/window-mediator;1"].
                      getService(Ci.nsIWindowMediator).
                      getMostRecentWindow("navigator:browser").document;
        let richlistitems = [];
        let backgroundColorToggle = false;
        items.forEach((item) => {
            let richlistitem = doc.createElement("richlistitem");
            richlistitem.setAttribute("download_task_id", item.id);
            let vbox = doc.createElement("vbox");
            let hbox = doc.createElement("hbox");
            let title = doc.createElement("label");
            let progressmeter = doc.createElement("progressmeter");
            let label = doc.createElement("label");
            let start = doc.createElement("toolbarbutton");
            let del = doc.createElement("toolbarbutton");

            start.setAttribute("id", "syno-start" + item.id);
            start.setAttribute("class", "sl-item-start");
            start.setAttribute("autocheck", "false");

            start.status = item.status;
            start.addEventListener("command", this.onStart, true);
            if (item.status == "paused") {
                start.setAttribute("style", "list-style-image: url(chrome://SynoLoader/skin/Play.png)");
            } else {
                start.setAttribute("style", "list-style-image: url(chrome://SynoLoader/skin/Pause.png)");
            }
            del.setAttribute("autocheck", "false");
            del.setAttribute("id", "syno-del" + item.id);
            del.setAttribute("class", "sl-item-del");
            del.setAttribute("style", "list-style-image: url(chrome://SynoLoader/skin/Stop.png)");
            del.addEventListener("command", this.onDelete, true);

            item.progress = (item.additional.transfer.size_downloaded / item.size) * 100;
            progressmeter.setAttribute("value", item.progress);
            progressmeter.setAttribute("class", "sl-item-progress");
            progressmeter.setAttribute("id", "syno-progress" + item.id);
            progressmeter.setAttribute("flex", "1");
            title.setAttribute("id", "syno-title" + item.id);
            title.setAttribute("value", item.title);
            title.setAttribute("crop", "center");
            title.setAttribute("class", "sl-item-title");

            label.setAttribute("value", item.status + " - " + this.fileSizeSI(item.additional.transfer.size_downloaded) + " of " + this.fileSizeSI(item.size) + " - " + item.progress.toFixed(2) + "%");
            label.setAttribute("id", "syno-label" + item.id);
            label.setAttribute("crop", "center");


            hbox.setAttribute("class", "sl-item-hbox");
            hbox.setAttribute("flex", "1");
            vbox.setAttribute("flex", "1");
            vbox.appendChild(title);

            hbox.appendChild(progressmeter);
            hbox.appendChild(start);
            hbox.appendChild(del);
            vbox.appendChild(hbox);
            vbox.appendChild(label);

            richlistitem.setAttribute("id", "syno-" + item.id);
            richlistitem.setAttribute("syno-id", item.id);
            richlistitem.setAttribute("class", "SynoLoader_Item");
            richlistitem.appendChild(vbox);
            if (backgroundColorToggle) {
                richlistitem.setAttribute("style", "background-color:#F0F0F0;");
            } else {
                richlistitem.setAttribute("style", "background-color:#E0E0E0;");
            }
            backgroundColorToggle = !backgroundColorToggle;

            richlistitems.push(richlistitem);
        });

        return richlistitems;
    };

    return this;
};
