var EXPORTED_SYMBOLS = ["Protocol"];
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

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


var Protocol = function (version, baseURL, timeout, username, password) {
    let connectionID = "",
        connectionIDEnc = "",
        usernameEnc = encodeURIComponent(username),
        passwordEnc = encodeURIComponent(password),
        // Version specific things.
        apiEndpoints = apiAllEndpoints[version],
        apiErrorTexts = apiAllErrorTexts[version];

    this.baseURL = baseURL;
    this.ed2kDownloadFolder = "home";

    this.connectTime = 0;

    const setErrorText = (response, errorCode, module) => {
        let hasErrorCode = (typeof errorCode !== "undefined"),
            hasModule = (typeof module !== "undefined");

        if(typeof apiErrorTexts[module][errorCode] !== "undefined") {
            response.error_text = apiErrorTexts[module][errorCode];
        } else if (typeof apiErrorTexts["common"][errorCode] !== "undefined") {
            response.error_text = apiErrorTexts["common"][errorCode];
        } else {
            response.error_text = apiErrorTexts["common"][100];
        }

        if (hasErrorCode && hasModule) {
            response.error_text = "(" + errorCode + ":" + module + ") " + response.error_text;
        } else if (hasErrorCode) {
            response.error_text = "(" + errorCode + ") " + response.error_text;
        } else if (hasModule) {
            response.error_text = "(" + module + ") " + response.error_text;
        }
    };

    const apiGetParameter = (task, action, extra) => {
        let taskParam = apiAllParameters[version][task],
            param = "";

        switch (task) {
            case "auth":
                param = taskParam.replace("%username%", usernameEnc).replace("%password%", passwordEnc);
                break;
            case "download":
                param = taskParam.base + taskParam[action];
                param = param.replace("%sid%", connectionIDEnc);

                switch (action) {
                    case "addurl":
                        param = param.replace("%uri%", extra);
                        break;
                    case "task":
                        param = param.replace("%action%", extra.action).replace("%id%", extra.id);
                        if (extra.action === "delete") {
                            param += "&force_complete=false";
                        }
                        break;
                }
        }
        return param;
    };

    this.connect = (callback) => {
        Util.log("try to connect to : " + this.baseURL);

        let response = {
                success: false,
                id: "",
                error_text: ""
            };

        Request(this.baseURL + apiEndpoints.auth,
            apiGetParameter("auth"),
            timeout,
            (apiResponse) => {
                if (apiResponse.status === 200) {
                    Util.log(apiResponse.text);

                    let apiJSON = apiResponse.json;
                    if (apiJSON !== false) {
                        if (version === 0) {
                            response.success = apiJSON.login_success;
                            if (response.success && typeof apiJSON.id !== "undefined") {
                                response.id = apiJSON.id;
                                this.setConnectionID(apiJSON.id);
                                this.connectTime = Date.now();
                            } else if (typeof apiJSON.errcode !== "undefined") {
                                setErrorText(response, apiJSON.errcode, "auth");
                            }
                        } else if (version === 1) {
                            response.success = apiJSON.success;
                            if (response.success && typeof apiJSON.data.sid !== "undefined") {
                                response.id = apiJSON.data.sid;
                                this.setConnectionID(apiJSON.data.sid);
                                this.connectTime = Date.now();
                            } else if (typeof apiJSON.error.code !== "undefined") {
                                setErrorText(response, apiJSON.error.code, "auth");
                            }
                        }
                    } else {
                        setErrorText(response, 100, "common");
                    }
                } else {
                    response.error_text = apiResponse.statusText;
                }
                Util.log(response.error_text);
                callback(response);
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
                data: [],
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
            let apiResponseCB = (apiResponse) => {
                    if (apiResponse.status === 200) {
                        Util.log(apiResponse.text);

                        let apiJSON = apiResponse.json;
                        response.success = (apiJSON && apiJSON.success);
                        if (version === 0) {
                            if (response.success && typeof apiJSON.items !== "undefined") {
                                response.items = apiJSON.items;
                            } else if (typeof apiJSON.errcode !== "undefined") {
                                setErrorText(response, apiJSON.errcode, "download");
                            } else {
                                setErrorText(response, 100, "common");
                            }
                        } else if (version === 1) {
                            if (response.success && typeof apiJSON.data.tasks !== "undefined") {
                                response.items = apiJSON.data.tasks;
                            } else if (typeof apiJSON.error.code !== "undefined") {
                                setErrorText(response, apiJSON.error.code, "download");
                            } else {
                                setErrorText(response, 100, "common");
                            }
                        }
                    } else {
                        response.error_text = apiResponse.statusText;
                    }
                    Util.log(response.error_text);
                    callback(response);
                },
                param = "";

            switch (action) {
                case "getall":
                    param = apiGetParameter("download", "getall");

                    Util.log("try to get all: " + param);
                    Request(this.baseURL + apiEndpoints.download.task,
                        param,
                        timeout,
                        apiResponseCB
                    ).get();
                    break;

                case "addurl":
                    param = apiGetParameter("download", "addurl", parameterEnc);

                    Util.log("try to add url (" + parameter + "): " + param);
                    Request(this.baseURL + apiEndpoints.download.task,
                        param,
                        timeout,
                        apiResponseCB
                    ).post();
                    break;

                case "addfile":
                    let formData = Cc["@mozilla.org/files/formdata;1"].
                                       createInstance(Ci.nsIDOMFormData);
                    formData.append("api", "SYNO.DownloadStation.Task");
                    formData.append("version", "1");
                    formData.append("method", "create");
                    formData.append("_sid", connectionIDEnc);
                    formData.append("file", File(parameter.path));

                    Util.log("try to add file to '" + parameter.path + "': " + formData);
                    Request(this.baseURL + apiEndpoints.download.task,
                        formData,
                        timeout,
                        apiResponseCB
                    ).post();
                    break;

                case "resume":
                case "pause":
                case "delete":
                    param = apiGetParameter("download", "task", {action: action, id: parameterEnc});
                    if (action === "delete") {
                        param += "&force_complete=false";
                    }

                    Util.log("try to " + action + " " + parameter + ": " + param);
                    Request(this.baseURL + apiEndpoints.download.task,
                        param,
                        timeout,
                        apiResponseCB
                    ).get();
                    break;
            }
        }
    };

    this.onResume = (event) => {
        let task = event.target.task;
        let action = "";
        switch (task.status) {
            case "downloading":
            case "seeding":
            case "waiting":
                action = "pause";
                break;
            case "paused":
                action = "resume";
                break;
            case "finished":
                if (task.type === "bt") {
                    action = "resume";
                }
            default:
                return;
        }
        this.task_action(() => {}, action, task.id);
    };

    this.onDelete = (event) => {
        this.task_action(() => {}, "delete", event.target.task.id);
    };

    this.fileSizeSI = (a, b, c, d, e) => {
        return (b = Math, c = b.log, d = 1e3, e = c(a) / c(d) | 0, a / b.pow(d, e)).toFixed(2) + " " + (e ? "kMGTPEZY" [--e] + "B" : "Bytes");
    };

    this.calcItems = (items) => {
        let doc = Cc["@mozilla.org/appshell/window-mediator;1"].
                      getService(Ci.nsIWindowMediator).
                      getMostRecentWindow("navigator:browser").document;
        let listitems = [];
        items.forEach((item) => {
            let listitem = doc.createElement("richlistitem");
            listitem.setAttribute("id", "sl-item-" + item.id);
            listitem.setAttribute("class", "sl-item");

            let wrapper = doc.createElement("hbox");
            wrapper.setAttribute("flex", "1");

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

            let deleteButton = doc.createElement("toolbarbutton");
            deleteButton.task = item;
            deleteButton.setAttribute("id", "sl-item-delete-" + item.id);
            deleteButton.setAttribute("class", "sl-item-delete");
            deleteButton.setAttribute("autocheck", "false");
            deleteButton.addEventListener("command", this.onDelete, true);

            wrapper.appendChild(resumeButton);
            wrapper.appendChild(deleteButton);

            listitem.appendChild(wrapper);

            listitems.push(listitem);
        });

        return listitems;
    };

    return this;
};