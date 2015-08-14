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
            let apiResponseCB = (apiResponse) => {
                    if (apiResponse.status === 200) {
                        let apiJSON = apiResponse.json;
                        if (!apiJSON.success) {
                            set_download_api_error_text(apiJSON.error.code, response);
                        }
                        response.success = apiJSON.success;
                        if (typeof apiJSON.data.tasks !== "undefined") {
                            response.items = apiJSON.data.tasks;
                        }
                        Util.log(apiResponse.text);
                    } else {
                        response.error_text = apiResponse.statusText;
                    }
                    callback(response);
                },
                apiBaseURL = "api=SYNO.DownloadStation.Task" +
                             "&version=1" +
                             "&_sid=" + connectionIDEncoded;

            switch (action) {
                case "addurl":
                    Util.log("try to add url : " + parameter);
                    Request(this.baseURL + apiEndpoints.download.task,
                        apiBaseURL +
                        "&method=create" +
                        "&uri=" + parameterEncoded,
                        timeout,
                        apiResponseCB
                    ).post();
                    break;

                case "addfile":
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
                        apiResponseCB
                    ).post();
                    break;

                case "getall":
                    Util.log("try to get all : " + this.baseURL);
                    Request(this.baseURL + apiEndpoints.download.task,
                        apiBaseURL +
                        "&method=list" +
                        "&additional=transfer",
                        timeout,
                        apiResponseCB
                    ).get();
                    break;

                case "resume":
                case "pause":
                case "delete":
                    Util.log("try to " + action + " " + parameterEncoded + " : " + this.baseURL);

                    let param = apiBaseURL +
                                "&method=" + encodeURIComponent(action) +
                                "&id=" + parameterEncoded;
                    if (action === "delete") {
                        param += "&force_complete=false";
                    }

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
