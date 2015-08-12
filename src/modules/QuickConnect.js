var EXPORTED_SYMBOLS = ["QuickConnect"];
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (typeof QuickConnect === "undefined") {
    Cu.import("resource://SynoLoader/Request.js");

    var QuickConnect = function (timeout_relay, timeout_internal, protocol, port) {
        var quick_connect = this;

        this.relai_server = "https://ukc.synology.com/Serv.php";
        this.get_server_info = function (quick_connect_id, callback) {
            var get_server_info_response = {
                success: false,
                internal_ip: [],
                external_ip: ""
            };
            var get_server = Request(
                quick_connect.relai_server,
                JSON.stringify({
                    version: "1",
                    command: "get_server_info",
                    serverID: quick_connect_id,
                    id: "dsm_https"
                }),
                timeout_relay,
                function (response) {
                    if (response.status === 200) {
                        if (response.json.errno === 0) {
                            get_server_info_response.success = true;
                            response.json.server.interface.forEach(function (entry) {
                                get_server_info_response.internal_ip.push(entry.ip);
                            });
                            get_server_info_response.external_ip = response.json.server.external.ip;
                        }
                    }
                    callback(get_server_info_response);
                }
            );
            get_server.post();
        };


        this.check_internal_ips = function (internal_ips, callback) {
            var check_internal_ips_response = {
                success: false,
                ip: ""
            };
            var not_first = false;
            var error_count = 0;
            internal_ips.forEach(function (ip) {
                var get_server = Request(
                    protocol + ip + ":" + port + "/webapi/query.cgi",
                    "api=SYNO.API.Info&version=1&method=query&query=api=SYNO.API.Info&version=1&method=query&query=SYNO.API.Auth,SYNO.DownloadStation.Task",
                    timeout_internal,
                    function (response) {
                        if (response.status === 200) {
                            if (not_first === false && response.json.success === true) {
                                not_first = true;
                                check_internal_ips_response.success = true;
                                check_internal_ips_response.ip = ip;
                                callback(check_internal_ips_response);
                            }
                        } else {
                            error_count++;
                            if (error_count >= internal_ips.length) {
                                callback(check_internal_ips_response);
                            }
                        }
                    }
                );
                get_server.post();
            });
        };


        this.get = function (quick_connect_id, callback) {
            var get_response = {
                success: false,
                ip: ""
            };
            quick_connect.get_server_info(quick_connect_id, function (response_info) {
                if (response_info.success === true) {
                    quick_connect.check_internal_ips(response_info.internal_ip, function (response_ip) {
                        get_response.success = true;
                        if (response_ip.success === true) {
                            get_response.ip = response_ip.ip;
                        } else {
                            get_response.ip = response_info.external_ip;
                        }
                        callback(get_response);
                    });
                } else {
                    get_response.ip = quick_connect_id;
                    callback(get_response);
                }
            });
        };

        return quick_connect;
    };
}
