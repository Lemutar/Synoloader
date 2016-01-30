var EXPORTED_SYMBOLS = ["QuickConnect"];

Components.utils.import("resource://SynoLoader/Request.js");

if (typeof QuickConnect === "undefined") {
    var QuickConnect = function(timeoutRelay, timeoutInternal, protocol, port) {
        this.relayServer = "https://ukc.synology.com/Serv.php";

        this.getServerInfo = (quickConnectID, callback) => {
            let response = {
                success: false,
                internalIP: [],
                externalIP: ""
            };

            new Request(
                this.relayServer,
                JSON.stringify({
                    version: "1",
                    command: "get_server_info",
                    serverID: quickConnectID,
                    id: "dsm_https"
                }),
                timeoutRelay, (relayResponse) => {
                    if (relayResponse.status === 200) {
                        if (relayResponse.json.errno === 0) {
                            response.success = true;
                            relayResponse.json.server.interface.forEach((entry) => {
                                response.internalIP.push(entry.ip);
                            });
                            response.externalIP = relayResponse.json.server.external.ip;
                        }
                    }
                    callback(response);
                }
            ).post();
        };


        this.checkInternalIPs = (internalIPs, callback) => {
            let first = true,
                errorCount = 0,
                response = {
                    success: false,
                    ip: ""
                };

            internalIPs.forEach((ip) => {
                new Request(
                    protocol + ip + ":" + port + "/webapi/query.cgi",
                    "api=SYNO.API.Info&version=1&method=query&query=api=SYNO.API.Info&version=1&method=query&query=SYNO.API.Auth,SYNO.DownloadStation.Task",
                    timeoutInternal, (apiResponse) => {
                        if (apiResponse.status === 200) {
                            if (first && apiResponse.json.success) {
                                first = false;
                                response.success = true;
                                response.ip = ip;
                                callback(response);
                            }
                        } else {
                            errorCount++;
                            if (errorCount >= internalIPs.length) {
                                callback(response);
                            }
                        }
                    }
                ).post();
            });
        };


        this.get = (quickConnectID, callback) => {
            let response = {
                success: false,
                ip: ""
            };

            this.getServerInfo(quickConnectID, (serverInfoResponse) => {
                if (serverInfoResponse.success) {
                    this.checkInternalIPs(serverInfoResponse.internalIP, (response_ip) => {
                        response.success = true;
                        if (response_ip.success) {
                            response.ip = response_ip.ip;
                        } else {
                            response.ip = serverInfoResponse.externalIP;
                        }
                        callback(response);
                    });
                } else {
                    response.ip = quickConnectID;
                    callback(response);
                }
            });
        };

        return this;
    };
}
