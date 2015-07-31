var EXPORTED_SYMBOLS = ["Request"];
const { classes: Cc, interfaces: Ci } = Components;

Components.utils.import("resource://SynoLoader/Util.js");

var Request = function(url, parameter, timeout, callback) {
    var request = this;

    this.http_request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance(Ci.nsIXMLHttpRequest);

    this.response = {
        text: "",
        statusText: "",
        status: 0,
        json: {}
    };

    this.http_request.timeout = timeout;
    this.http_request.ontimeout = function() {
        request.response.status = 408;
        request.response.statusText = "Request Time-out";
        callback(request.response);
    };

    this.http_request.onreadystatechange = function() {
        if (request.http_request.readyState == 4) {
            switch (request.http_request.status) {
                case 0:
                    break;
                case 200:
                    request.response.text = request.http_request.responseText;
                    try {
                        request.response.json = JSON.parse(request.http_request.responseText);
                    } catch (e) {}
                    break;
                default:
                    break;
            }

            request.response.statusText = request.http_request.statusText;
            request.response.status = request.http_request.status;
            callback(request.response);
        }
    };

    this.post = function() {
        request.http_request.open('POST', url, true);
        request.http_request.send(parameter);
    };

    this.get = function() {
        request.http_request.open('GET', url + "?" + parameter, true);
        request.http_request.send(null);
    };

    return request;
};
