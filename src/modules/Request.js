var EXPORTED_SYMBOLS = ["Request"];
let {
    classes: Cc,
    interfaces: Ci,
    utils: Cu
} = Components;

if (typeof Request === "undefined") {
    var Request = function(url, parameter, timeout, callback) {
        this.httpRequest = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
            .createInstance(Ci.nsIXMLHttpRequest);

        let response = {
            text: "",
            statusText: "",
            status: 0,
            json: {}
        };

        this.httpRequest.timeout = timeout;
        this.httpRequest.ontimeout = () => {
            response.status = 408;
            response.statusText = "Request Time-out";
            callback(response);
        };

        this.httpRequest.onreadystatechange = () => {
            if (this.httpRequest.readyState === 4) {
                response.json = false;
                response.status = this.httpRequest.status;
                response.statusText = this.httpRequest.statusText;
                response.text = this.httpRequest.responseText;

                switch (response.status) {
                    case 0:
                        response.statusText = "Couldn't connect to host.";
                        break;
                    case 200:
                        try {
                            response.json = JSON.parse(response.text);
                        } catch (e) {}
                        break;
                }

                callback(response);
            }
        };

        this.get = () => {
            this.httpRequest.open("GET", url + "?" + parameter, true);
            this.httpRequest.send(null);
        };

        this.post = () => {
            this.httpRequest.open("POST", url, true);
            this.httpRequest.send(parameter);
        };

        return this;
    };
}
