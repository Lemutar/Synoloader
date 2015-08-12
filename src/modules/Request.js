var EXPORTED_SYMBOLS = ["Request"];
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (typeof Request === "undefined") {
    Cu.import("resource://SynoLoader/Util.js");

    var Request = function (url, parameter, timeout, callback) {
        let self = this;

        this.httpRequest = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].
                               createInstance(Ci.nsIXMLHttpRequest);

        let response = {
            text: "",
            statusText: "",
            status: 0,
            json: {}
        };

        this.httpRequest.timeout = timeout;
        this.httpRequest.ontimeout = function () {
            response.status = 408;
            response.statusText = "Request Time-out";
            callback(response);
        };

        this.httpRequest.onreadystatechange = function () {
            if (self.httpRequest.readyState === 4) {
                if (self.httpRequest.status === 200) {
                    response.text = self.httpRequest.responseText;
                    try {
                        response.json = JSON.parse(self.httpRequest.responseText);
                    } catch (e) {}
                }

                response.statusText = self.httpRequest.statusText;
                response.status = self.httpRequest.status;
                callback(response);
            }
        };

        this.get = function () {
            this.httpRequest.open("GET", url + "?" + parameter, true);
            this.httpRequest.send(null);
        };

        this.post = function () {
            this.httpRequest.open("POST", url, true);
            this.httpRequest.send(parameter);
        };

        return this;
    };
}
