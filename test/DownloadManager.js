utils.include(utils.baseURL + "../src/modules/DownloadManager.js");

let {
    classes: Cc,
    interfaces: Ci,
    utils: Cu
} = Components;

let response, loaded, server, prefs;
let cb = (res) => {
    response = res;
    loaded.value = true;
};

function setUp() {
    response = {};
    loaded = {
        value: false
    };
}

function tearDown() {}

function startUp() {
    server = utils.setUpHttpServer(4445, "../fixtures");

    prefs = Cc["@mozilla.org/preferences-service;1"].
        getService(Ci.nsIPrefService).
        getBranch("extensions.SynoLoader.");

    prefs.setCharPref("dsm_version", 2);
}

function shutDown() {
    utils.tearDownHttpServer(4445);
}


function setUpAPI() {
    DownloadManager.username = "username";
    DownloadManager.password = "password";
    DownloadManager.setProtocol();
    DownloadManager.protocol.baseURL = "http://localhost:4445";
    DownloadManager.protocol.connectTime = Date.now();
    DownloadManager.protocol.setConnectionID("CONNECTION_ID");
}

function setUpNotificationMock(title, text) {
    let NotificationMock = new Mock(Notification);
    NotificationMock.expect("show", [title, text], null).
    andStub(() => {
        loaded.value = true;
    }).
    times(1);
    Notification = NotificationMock;
}


test_DownloadManager_transferToNas_failed_mock.description = "test_DownloadManager_transferToNas_failed_mock";
test_DownloadManager_transferToNas_failed_mock.priority = "must";

function test_DownloadManager_transferToNas_failed_mock() {
    utils.writeTo('{"error":{"code":105},"success":false}', "../fixtures/action.txt");
    server.expect("/webapi/DownloadStation/task.cgi", 200, "/action.txt");

    setUpAPI();
    setUpNotificationMock("Send link failed", "The logged in session does not have permission");

    DownloadManager.transferToNas("link");

    utils.wait(loaded);
}

test_DownloadManager_transferToNas_link_success_mock.description = "test_DownloadManager_transferToNas_link_success_mock";
test_DownloadManager_transferToNas_link_success_mock.priority = "must";

function test_DownloadManager_transferToNas_link_success_mock() {
    utils.writeTo('{"success":true}', "../fixtures/action.txt");
    server.expect("/webapi/DownloadStation/task.cgi", 200, "/action.txt");

    setUpAPI();
    setUpNotificationMock("Send link", "link");

    DownloadManager.transferToNas("link");

    utils.wait(loaded);
}

test_DownloadManager_transferToNas_torrent_file_success_mock.description = "test_DownloadManager_transferToNas_torrent_file_success_mock";
test_DownloadManager_transferToNas_torrent_file_success_mock.priority = "must";

function test_DownloadManager_transferToNas_torrent_file_success_mock() {
    utils.writeTo("42", "../fixtures/test_torrent.txt");
    server.expect("/test.torrent", 200, "/test_torrent.txt");

    utils.writeTo('{"success":true}', "../fixtures/action.txt");
    server.expect("/webapi/DownloadStation/task.cgi", 200, "/action.txt");

    setUpAPI();
    setUpNotificationMock("Send torrent file to NAS", "http://localhost:4445/test.torrent");

    DownloadManager.transferToNas("http://localhost:4445/test.torrent");

    utils.wait(loaded);
}

test_DownloadManager_convertOldURL_host.description = "test_DownloadManager_convertOldURL_host";
test_DownloadManager_convertOldURL_host.priority = "must";

function test_DownloadManager_convertOldURL_host() {
    prefs.setCharPref("protocol", "test");
    prefs.setCharPref("host", "");
    DownloadManager.convertOldURL("http://localhost");
    assert.equals("http", prefs.getCharPref("protocol"));
    assert.equals("localhost", prefs.getCharPref("host"));
}

test_DownloadManager_not_convertOldURL_protocol.description = "test_DownloadManager_not_convertOldURL_protocol";
test_DownloadManager_not_convertOldURL_protocol.priority = "must";

function test_DownloadManager_not_convertOldURL_protocol() {
    prefs.setCharPref("protocol", "test");
    prefs.setCharPref("host", "");
    DownloadManager.convertOldURL("localhost");
    assert.equals("test", prefs.getCharPref("protocol"));
    assert.equals("localhost", prefs.getCharPref("host"));
}

test_DownloadManager_convertOldURL_port.description = "test_DownloadManager_not_convertOldURL_port";
test_DownloadManager_convertOldURL_port.priority = "must";

function test_DownloadManager_convertOldURL_port() {
    prefs.setCharPref("port", "test");
    prefs.setCharPref("host", "");
    DownloadManager.convertOldURL("http://localhost:12345");
    assert.equals("localhost", prefs.getCharPref("host"));
    assert.equals("12345", prefs.getCharPref("port"));
}

test_DownloadManager_convertOldURL_ip_port.description = "test_DownloadManager_convertOldURL_ip_port";
test_DownloadManager_convertOldURL_ip_port.priority = "must";

function test_DownloadManager_convertOldURL_ip_port() {
    prefs.setCharPref("port", "test");
    prefs.setCharPref("host", "");
    DownloadManager.convertOldURL("http://192.168.1.2:12345");
    assert.equals("192.168.1.2", prefs.getCharPref("host"));
    assert.equals("12345", prefs.getCharPref("port"));
}
