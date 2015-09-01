utils.include(utils.baseURL + "../src/modules/QuickConnect.js");

let response, loaded, server, quickConnect;
let cb = (res) => {
    response = res;
    loaded.value = true;
};

function setUp() {
    response = {};
    loaded = {
        value: false
    };

    server = utils.setUpHttpServer(4445, "fixtures");
}

function tearDown() {
    utils.tearDownHttpServer(4445);
}

function startUp() {}

function shutDown() {}


test_quick_connect_get_nas_info.description = "test_quick_connect_get_nas_info";

function test_quick_connect_get_nas_info() {
    let quickConnectResponse = '{"version":1,"command":"get_server_info","errno":0,"server"' +
        ':{"serverID":"002834820","ddns":"QuickConnectID.synology.me","fqdn":"NULL","ipv6_tunnel":[],"gateway":"192.168.0.1","interface":' +
        '[{"ip":"192.168.0.200","ipv6":[{"addr_type":32,"address":"fe80::211:32ff:fe0a:d061","prefix_length":64,"scope":"link"}],' +
        '"mask":"255.255.255.0","name":"eth0"},{"ip":"192.168.0.150","ipv6":[{"addr_type":32,"address":"fe80::211:32ff:fe0a:d061","prefix_length":64,"scope":"link"}],' +
        '"mask":"255.255.255.0","name":"eth0"}],"external":{"ip":"217.162.254.219"},"behind_nat":true,"udp_punch_port":41864,"tcp_punch_port":0,"ds_state":"OFFLINE"},' +
        '"client":{"external":{"ip":"217.162.254.219"}},"env":{"relay_region":"de","control_host":"dec.quickconnect.to"},"service":{"port":5001,"ext_port":0,"pingpong":"UNKNOWN"}}';
    utils.writeTo(quickConnectResponse, "fixtures/connect.txt");
    server.expect("/relayServer.php", 200, "/connect.txt");

    quickConnect = QuickConnect(1000, 200, "http://", 4445);
    quickConnect.relayServer = "http://localhost:4445/relayServer.php";
    quickConnect.getServerInfo("QuickConnectID", cb);

    utils.wait(loaded);
    assert.equals(true, response.success);
    assert.equals("192.168.0.200", response.internalIP[0]);
    assert.equals("192.168.0.150", response.internalIP[1]);
    assert.equals("217.162.254.219", response.externalIP);
}

test_quick_connect_get_nas_info_fail.description = "test_quick_connect_get_nas_info_fail";

function test_quick_connect_get_nas_info_fail() {
    let quickConnectResponse = '{"version":1,"command":"get_server_info","errno":1,"server"' +
        ':{"serverID":"002834820","ddns":"QuickConnectID.synology.me","fqdn":"NULL","ipv6_tunnel":[],"gateway":"192.168.0.1","interface":' +
        '[{"ip":"192.168.0.200","ipv6":[{"addr_type":32,"address":"fe80::211:32ff:fe0a:d061","prefix_length":64,"scope":"link"}],' +
        '"mask":"255.255.255.0","name":"eth0"},{"ip":"192.168.0.150","ipv6":[{"addr_type":32,"address":"fe80::211:32ff:fe0a:d061","prefix_length":64,"scope":"link"}],' +
        '"mask":"255.255.255.0","name":"eth0"}],"external":{"ip":"217.162.254.219"},"behind_nat":true,"udp_punch_port":41864,"tcp_punch_port":0,"ds_state":"OFFLINE"},' +
        '"client":{"external":{"ip":"217.162.254.219"}},"env":{"relay_region":"de","control_host":"dec.quickconnect.to"},"service":{"port":5001,"ext_port":0,"pingpong":"UNKNOWN"}}';
    utils.writeTo(quickConnectResponse, "fixtures/connect.txt");
    server.expect("/relayServer.php", 200, "/connect.txt");

    quickConnect = QuickConnect(1000, 200, "http://", 4445);
    quickConnect.relayServer = "http://localhost:4445/relayServer.php";
    quickConnect.getServerInfo("QuickConnectID", cb);

    utils.wait(loaded);
    assert.equals(false, response.success);
}

test_quick_connect_get_nas_info_fail_no_answer.description = "test_quick_connect_get_nas_info_fail_no_answer";

function test_quick_connect_get_nas_info_fail_no_answer() {
    quickConnect = QuickConnect(1000, 200, "http://", 4445);
    quickConnect.relayServer = "http://localhost:4445/relayServer.php";
    quickConnect.getServerInfo("QuickConnectID", cb);

    utils.wait(loaded);
    assert.equals(false, response.success);
}

test_quick_connect_checkInternalIPs.description = "test_quick_connect_checkInternalIPs";

function test_quick_connect_checkInternalIPs() {
    let internalIPs = ["localhost:4445/ip_1", "localhost:4445/ip_2"];

    utils.writeTo('{"data":2,"success":true}', "fixtures/connect.txt");
    server.expect("/ip_1:4445/webapi/query.cgi", 200, {
        path: "/connect.txt",
        delay: 100
    });
    server.expect("/ip_2:4445/webapi/query.cgi", 200, {
        path: "/connect.txt",
        delay: 50
    });

    quickConnect = QuickConnect(1000, 200, "http://", 4445);
    quickConnect.checkInternalIPs(internalIPs, cb);

    utils.wait(loaded);
    assert.equals(true, response.success);
    assert.equals("localhost:4445/ip_2", response.ip);
}

test_quick_connect_checkInternalIPs_timeout.description = "test_quick_connect_checkInternalIPs_timeout";

function test_quick_connect_checkInternalIPs_timeout() {
    let internalIPs = ["localhost:4445/ip_1", "localhost:4445/ip_2"];

    utils.writeTo('{"data":2,"success":true}', "fixtures/connect.txt");
    server.expect("/ip_1:4445/webapi/query.cgi", 200, {
        path: "/connect.txt",
        delay: 300
    });
    server.expect("/ip_2:4445/webapi/query.cgi", 200, {
        path: "/connect.txt",
        delay: 300
    });

    quickConnect = QuickConnect(1000, 200, "http://", 4445);
    quickConnect.checkInternalIPs(internalIPs, cb);

    utils.wait(loaded);
    assert.equals(false, response.success);
    assert.equals("", response.ip);
}

test_quick_connect_checkInternalIPs_fail.description = "test_quick_connect_checkInternalIPs_fail";

function test_quick_connect_checkInternalIPs_fail() {
    let internalIPs = ["localhost:4445/ip_1", "localhost:4445/ip_2"];

    quickConnect = QuickConnect(1000, 200, "http://", 4445);
    quickConnect.checkInternalIPs(internalIPs, cb);

    utils.wait(loaded);
    assert.equals(false, response.success);
}

test_quick_connect_internal.description = "test_quick_connect_internal";

function test_quick_connect_internal() {
    quickConnect = QuickConnect(1000, 200);

    quickConnect.getServerInfo = (id, callback) => {
        let serverInfoResponse = {
            success: true,
            internalIP: ["1", "2"],
            externalIP: "3"
        };
        assert.equals("QuickConnectID", id);
        callback(serverInfoResponse);
    };

    quickConnect.checkInternalIPs = (ips, callback) => {
        let serverInfoResponse = {
            success: true,
            ip: "1"
        };
        assert.equals(["1", "2"], ips);
        callback(serverInfoResponse);
    };

    quickConnect.get("QuickConnectID", cb);

    utils.wait(loaded);
    assert.equals(true, response.success);
    assert.equals("1", response.ip);
}

test_quick_connect_server_info_fail.description = "test_quick_connect_server_info_fail";

function test_quick_connect_server_info_fail() {
    quickConnect = QuickConnect(1000, 200);

    quickConnect.getServerInfo = (id, callback) => {
        let serverInfoResponse = {
            success: false,
            internalIP: ["1", "2"],
            externalIP: "3"
        };
        assert.equals("QuickConnectID", id);
        callback(serverInfoResponse);
    };

    quickConnect.get("QuickConnectID", cb);

    utils.wait(loaded);
    assert.equals(false, response.success);
    assert.equals("QuickConnectID", response.ip);
}

test_quick_connect_external.description = "test_quick_connect_external";

function test_quick_connect_external() {
    quickConnect = QuickConnect(1000, 200);

    quickConnect.getServerInfo = (id, callback) => {
        let serverInfoResponse = {
            success: true,
            internalIP: ["1", "2"],
            externalIP: "3"
        };
        assert.equals("QuickConnectID", id);
        callback(serverInfoResponse);
    };

    quickConnect.checkInternalIPs = (ips, callback) => {
        let serverInfoResponse = {
            success: false,
            ip: "1"
        };
        assert.equals(["1", "2"], ips);
        callback(serverInfoResponse);
    };

    quickConnect.get("QuickConnectID", cb);

    utils.wait(loaded);
    assert.equals(true, response.success);
    assert.equals("3", response.ip);
}
