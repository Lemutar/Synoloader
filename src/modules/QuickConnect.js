var EXPORTED_SYMBOLS = ["QuickConnect"];

Components.utils.import("resource://SynoLoader/Request.js");
Components.utils.import("resource://SynoLoader/Util.js");

if (typeof QuickConnect === "undefined") {
    var QuickConnect = function(timeoutRelay, timeoutInternal, protocol, port) {
        this.relayServer = "https://global.quickconnect.to/Serv.php";

        this.getQuickConnectServers = (callback) => {
            let response = {
                success: false,
                quick_connect_servers: [],
            };

            new Request(
                this.relayServer,
                JSON.stringify({
                    version: "1",
                    command: "get_site_list",
                }),
                timeoutRelay, (relayResponse) => {
                    if (relayResponse.status === 200) {
                        if (relayResponse.json.errno === 0) {
                            response.success = true;
                            relayResponse.json.sites.forEach((entry) => {
                                response.quick_connect_servers.push(entry);
                            });
                            Util.log(relayResponse.text);
                        }
                    }
                    callback(response);
                }).post();
        };

        this.getServerTunnelInfo = (serverUrl, quickConnectID, callback) => {
            let response = {
                success: false,
                ip: "",
                port: ""
            };

            new Request(
                "https://" + serverUrl + "/Serv.php",
                JSON.stringify({
                    version: "1",
                    command: "request_tunnel",
                    serverID: quickConnectID,
                    id: "dsm_https"
                }),
                timeoutRelay, (relayResponse) => {
                    if (relayResponse.status === 200) {
                        if (relayResponse.json.errno === 0) {
                            response.ip = self._settings.quickConnectId + "." + serverUrl.split(".").slice(0, 2) + ".quickconnect.to";
                            response.port = data.service.https_port ? data.service.https_port : 443;
                            response.success = true;
                        }
                        Util.log(relayResponse.text);
                    }
                    callback(response);
                }).post();
        };

        this.getServerInfo = (serverUrl, quickConnectID, callback) => {
            let response = {
                success: false,
                internalIP: [],
                externalIP: ""
            };

            new Request(
                serverUrl,
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
                        Util.log(relayResponse.text);
                    }
                    callback(response);
                }
            ).post();
        };

        this.getConnections = (quickConnectID, callback) => {
            let first = true;
            let errorCount = 0;
            this.getQuickConnectServers((responseServers) => {
                if (responseServers.success === true) {
                    responseServers.quick_connect_servers.forEach((entry) => {
                        this.getServerInfo("https://" + entry + "/Serv.php", quickConnectID, (responseServerInfo) => {
                            if (first && responseServerInfo.success) {
                                callback(responseServerInfo);
                            } else {
                                errorCount++;
                                if (errorCount >= responseServers.quick_connect_servers.length) {
                                    callback(responseServerInfo);
                                }
                            }
                        });
                    });
                } else {
                    callback(responseServers);
                }
            });

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

            this.getConnections(quickConnectID, (serverInfoResponse) => {
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
