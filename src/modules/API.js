var EXPORTED_SYMBOLS = ["Protocol"];
let {
    classes: Cc,
    interfaces: Ci,
    utils: Cu
} = Components;

Cu.import("resource://SynoLoader/Request.js");
Cu.import("resource://SynoLoader/Util.js");

try {
    Cu.importGlobalProperties(["File"]);
} catch (e) {
    Util.log("importGlobalProperties([\"File\"]) fail");
}

const apiAllErrorTexts = {
    0: {
        common: {
            100: "Unknown error"
        },
        auth: {
            "-2": "Incorrect password",
            "-5": "No such account"
        }
    },
    1: {
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
    }
};

const apiAllEndpoints = {
    0: {
        auth: "/download/download_redirector.cgi",
        download: {
            task: "/download/download_redirector.cgi"
        }
    },
    1: {
        auth: "/webapi/auth.cgi",
        download: {
            task: "/webapi/DownloadStation/task.cgi"
        }
    }
};

const apiAllParameters = {
    0: {
        auth: "action=login&username=%username%&passwd=%password%",
        download: {
            base: "id=%sid%",
            task: "&action=%action%&idList=%id%",
            addurl: "&action=addurl&url=%uri%",
            getall: "&action=getall"
        }
    },
    1: {
        auth: "api=SYNO.API.Auth&version=2&method=login&account=%username%&passwd=%password%&session=DownloadStation&format=sid",
        download: {
            base: "api=SYNO.DownloadStation.Task&version=1&_sid=%sid%",
            task: "&method=%action%&id=%id%",
            addurl: "&method=create&uri=%uri%",
            getall: "&method=list&additional=transfer"
        }
    }
};

const apiAllResponseCallbacks = {
    0: {
        auth: (apiObj, response, apiResponse) => {
            let apiJSON = apiResponse.json;
            if (apiJSON !== false) {
                response.success = apiJSON.login_success;
                if (response.success && Util.val("id", apiJSON)) {
                    response.id = apiJSON.id;
                    apiObj.setConnectionID(apiJSON.id);
                    apiObj.connectTime = Date.now();
                } else if (Util.val("errcode", apiJSON)) {
                    apiObj.setErrorText(response, apiJSON.errcode, "auth");
                } else {
                    apiObj.setErrorText(response, 100, "common");
                }
            } else {
                apiObj.setErrorText(response, 100, "common");
            }
        },
        download: (apiObj, response, apiResponse) => {
            let apiJSON = apiResponse.json;
            response.success = (apiJSON && apiJSON.success);
            if (response.success) {
                if (Util.val("items", apiJSON)) {
                    response.items = apiJSON.items;
                }
            } else if (Util.val("errcode", apiJSON)) {
                apiObj.setErrorText(response, apiJSON.errcode, "download");
            } else {
                apiObj.setErrorText(response, 100, "common");
            }
        }
    },
    1: {
        auth: (apiObj, response, apiResponse) => {
            let apiJSON = apiResponse.json;
            if (apiJSON !== false) {
                response.success = apiJSON.success;
                if (response.success && Util.val("data.sid", apiJSON)) {
                    response.id = apiJSON.data.sid;
                    apiObj.setConnectionID(apiJSON.data.sid);
                    apiObj.connectTime = Date.now();
                } else if (Util.val("error.code", apiJSON)) {
                    apiObj.setErrorText(response, apiJSON.error.code, "auth");
                } else {
                    apiObj.setErrorText(response, 100, "common");
                }
            } else {
                apiObj.setErrorText(response, 100, "common");
            }
        },
        download: (apiObj, response, apiResponse) => {
            let apiJSON = apiResponse.json;
            response.success = (apiJSON && apiJSON.success);
            if (response.success) {
                if (Util.val("data.tasks", apiJSON)) {
                    response.items = apiJSON.data.tasks;
                }
            } else if (Util.val("error.code", apiJSON)) {
                apiObj.setErrorText(response, apiJSON.error.code, "download");
            } else {
                apiObj.setErrorText(response, 100, "common");
            }
        }
    }
};

var Protocol = function(version, baseURL, timeout, username, password) {
    let connectionID = "",
        connectionIDEnc = "",
        usernameEnc = encodeURIComponent(username),
        passwordEnc = encodeURIComponent(password),
        // Version specific things.
        apiEndpoints = apiAllEndpoints[version],
        apiErrorTexts = apiAllErrorTexts[version];

    this.ed2kDownloadFolder = "home";

    this.baseURL = baseURL;

    this.connectTime = 0;

    this.setErrorText = (response, errorCode, module) => {
        let hasErrorCode = (typeof errorCode !== "undefined"),
            hasModule = (typeof module !== "undefined");

        if (typeof apiErrorTexts[module][errorCode] !== "undefined") {
            response.error_text = apiErrorTexts[module][errorCode];
        } else if (typeof apiErrorTexts.common[errorCode] !== "undefined") {
            response.error_text = apiErrorTexts.common[errorCode];
        } else {
            response.error_text = apiErrorTexts.common[100];
        }
    };

    const apiGetParameter = (module, action, extra) => {
        let taskParam = apiAllParameters[version][module],
            param = "";

        switch (module) {
            case "auth":
                param = taskParam.replace("%username%", usernameEnc).replace("%password%", passwordEnc);
                break;
            case "download":
                param = taskParam.base.replace("%sid%", connectionIDEnc) + taskParam[action];

                switch (action) {
                    case "addurl":
                        param = param.replace("%uri%", extra);
                        break;
                    case "task":
                        param = param.replace("%action%", extra.action).replace("%id%", extra.id);
                        break;
                }
        }
        return param;
    };

    const apiResponseCallback = (callback, response, apiResponse, module) => {
        let responseCallback = apiAllResponseCallbacks[version][module];

        if (apiResponse.status === 200) {
            responseCallback(this, response, apiResponse);
            Util.log(apiResponse.text);
        } else {
            response.error_text = apiResponse.statusText;
            Util.log(response.error_text);
        }
        callback(response);
    };

    this.connect = (callback) => {
        Util.log("try to connect: " + this.baseURL);

        let response = {
            success: false,
            id: "",
            error_text: ""
        };

        new Request(this.baseURL + apiEndpoints.auth,
            apiGetParameter("auth"),
            timeout, (apiResponse) => {
                apiResponseCallback(callback, response, apiResponse, "auth");
            }
        ).get();
    };

    this.setConnectionID = (id) => {
        connectionID = id;
        connectionIDEnc = encodeURIComponent(id);
    };

    this.task_action = (callback, action, parameter) => {
        let response = {
                success: false,
                items: [],
                error_text: ""
            },
            parameterEnc = encodeURIComponent(parameter);

        if (Date.now() - this.connectTime > 1000 * 60 * 20) {
            this.connect((connectResponse) => {
                if (connectResponse.success) {
                    this.task_action(callback, action, parameter);
                } else {
                    callback(connectResponse);
                }
            });
        } else {
            let url = this.baseURL + apiEndpoints.download.task,
                method = "",
                param = "";

            switch (action) {
                case "getall":
                    method = "get";
                    param = apiGetParameter("download", "getall");

                    Util.log("try to get all: " + param);
                    break;

                case "addurl":
                    method = "post";
                    param = apiGetParameter("download", "addurl", parameterEnc);

                    Util.log("try to add url (" + parameter + "): " + param);
                    break;

                case "addfile":
                    method = "post";
                    param = Cc["@mozilla.org/files/formdata;1"]
                        .createInstance(Ci.nsIDOMFormData);
                    param.append("api", "SYNO.DownloadStation.Task");
                    param.append("version", "1");
                    param.append("method", "create");
                    param.append("_sid", connectionIDEnc);
                    param.append("file", File(parameter.path));

                    Util.log("try to add file to '" + parameter.path + "': " + param);
                    break;

                case "delete":
                case "resume":
                case "pause":
                    method = "get";
                    param = apiGetParameter("download", "task", {
                        action: action,
                        id: parameterEnc
                    }) + param;

                    if (action === "delete") {
                        param += "&force_complete=false";
                    }

                    Util.log("try to " + action + " " + parameter + ": " + param);
                    break;
            }

            let request = new Request(url, param, timeout, (apiResponse) => {
                apiResponseCallback(callback, response, apiResponse, "download");
            });
            switch (method) {
                case "get":
                    request.get();
                    break;
                case "post":
                    request.post();
                    break;
            }
        }
    };

    this.onResume = (event) => {
        this.task_action(() => {}, event.target.action, event.target.task.id);
    };

    this.onDelete = (event) => {
        this.task_action(() => {}, "delete", event.target.task.id);
    };

    this.fileSizeSI = (a, b, c, d, e) => {
        return (b = Math, c = b.log, d = 1e3, e = c(a) / c(d) | 0, a / b.pow(d, e)).toFixed(2) + " " + (e ? "kMGTPEZY" [--e] + "B" : "Bytes");
    };

    this.calcItems = (items) => {
        let doc = Cc["@mozilla.org/appshell/window-mediator;1"]
            .getService(Ci.nsIWindowMediator)
            .getMostRecentWindow("navigator:browser").document;
        let listitems = [];
        items.forEach((item) => {
            let listitem = doc.createElement("richlistitem");
            listitem.setAttribute("id", "sl-item-" + item.id);
            listitem.setAttribute("class", "sl-item");

            let wrapper = doc.createElement("hbox");
            wrapper.setAttribute("flex", "1");

            let statusButton = doc.createElement("toolbarbutton");
            statusButton.setAttribute("id", "sl-item-status-" + item.id);
            statusButton.setAttribute("class", "sl-item-status");
            statusButton.setAttribute("style", "list-style-image: url(chrome://SynoLoader/skin/status_" + item.status + ".png);");
            statusButton.setAttribute("autocheck", "false");

            wrapper.appendChild(statusButton);

            // Item Info.
            let iteminfo = doc.createElement("vbox");
            iteminfo.setAttribute("class", "sl-item-info");
            iteminfo.setAttribute("flex", "1");

            let title = doc.createElement("label");
            title.setAttribute("id", "sl-item-title-" + item.id);
            title.setAttribute("class", "sl-item-title");
            title.setAttribute("value", item.title);
            title.setAttribute("crop", "center");

            item.slProgress = (item.additional.transfer.size_downloaded / item.size) * 100;
            let progress = doc.createElement("progressmeter");
            progress.setAttribute("id", "sl-item-progress-" + item.id);
            progress.setAttribute("class", "sl-item-progress");
            progress.setAttribute("value", item.slProgress);
            progress.setAttribute("flex", "1");

            item.slSizeDownloaded = this.fileSizeSI(item.additional.transfer.size_downloaded);
            item.slSizeTotal = this.fileSizeSI(item.size);
            let meta = doc.createElement("label");
            meta.setAttribute("id", "sl-item-meta-" + item.id);
            meta.setAttribute("value", item.status + " - " + item.slSizeDownloaded + " of " + item.slSizeTotal + " - " + item.slProgress.toFixed(2) + "%");
            meta.setAttribute("crop", "center");

            iteminfo.appendChild(title);
            iteminfo.appendChild(progress);
            iteminfo.appendChild(meta);

            wrapper.appendChild(iteminfo);

            // Control buttons.
            let resumeButton = doc.createElement("toolbarbutton");
            resumeButton.task = item;
            resumeButton.setAttribute("id", "sl-item-resume-" + item.id);
            resumeButton.setAttribute("class", "sl-item-resume");
            resumeButton.setAttribute("status", item.status);
            resumeButton.setAttribute("autocheck", "false");
            resumeButton.addEventListener("command", this.onResume, true);

            switch (item.status) {
                case "downloading":
                case "seeding":
                case "waiting":
                case "finishing":
                case "hash_checking":
                case "filehosting_waiting":
                case "extracting":
                    resumeButton.action = "pause";
                    break;
                case "paused":
                case "error":
                    resumeButton.action = "resume";
                    break;
                case "finished":
                    if (item.type === "bt") {
                        resumeButton.action = "resume";
                    }
                    break;
            }
            resumeButton.setAttribute("style", "list-style-image: url(chrome://SynoLoader/skin/" + resumeButton.action + ".png);");

            let deleteButton = doc.createElement("toolbarbutton");
            deleteButton.task = item;
            deleteButton.setAttribute("id", "sl-item-delete-" + item.id);
            deleteButton.setAttribute("class", "sl-item-delete");
            deleteButton.setAttribute("autocheck", "false");
            deleteButton.addEventListener("command", this.onDelete, true);
            deleteButton.setAttribute("style", "list-style-image: url(chrome://SynoLoader/skin/delete.png);");

            wrapper.appendChild(resumeButton);
            wrapper.appendChild(deleteButton);

            listitem.appendChild(wrapper);

            listitems.push(listitem);
        });

        return listitems;
    };
};
