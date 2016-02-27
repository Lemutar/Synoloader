utils.include(utils.baseURL + "../src/modules/QuickConnect.js");
utils.include(utils.baseURL + "../src/modules/Request.js");

function setUp() {

}

function tearDown() {

}

function startUp() {

}

function shutDown() {

}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

test_Synoloader_QuickConnect_get_servers.description = 'test_Synoloader_QuickConnect_get_servers';
test_Synoloader_QuickConnect_get_servers.priority = 'must';

function test_Synoloader_QuickConnect_get_servers() {

    myconnect = QuickConnect(5000, 5000, "http://", 5050);
    myresponse = {};
    var loaded = {
        value: false
    };
    var setdone = function(response) {
        myresponse = response;
        loaded.value = true;
    };
    myconnect.getQuickConnectServers(setdone);
    utils.wait(loaded);
    assert.equals(true, myresponse.success);
    assert.equals(true, contains(myresponse.quick_connect_servers, "twc.quickconnect.to"));
}

test_Synoloader_QuickConnect_get_server_detail.description = 'test_Synoloader_QuickConnect_get_server_detail';
test_Synoloader_QuickConnect_get_server_detail.priority = 'must';

function test_Synoloader_QuickConnect_get_server_detail() {

    myconnect = QuickConnect(5000, 5000, "http://", 5050);
    myresponse = {};
    var loaded = {
        value: false
    };
    var setdone = function(response) {
        myresponse = response;
        loaded.value = true;
    };
    myconnect.getServerInfo("dec.quickconnect.to", "lemutar", setdone);
    utils.wait(loaded);
    assert.equals(true, myresponse.success);

}

test_Synoloader_QuickConnect_get_connections.description = 'test_Synoloader_QuickConnect_get_connections';
test_Synoloader_QuickConnect_get_connections.priority = 'must';

function test_Synoloader_QuickConnect_get_connections() {

    myconnect = QuickConnect(5000, 5000, "http://", 5050);
    myresponse = {};
    var loaded = {
        value: false
    };
    var setdone = function(response) {
        myresponse = response;
        loaded.value = true;
    };
    myconnect.getConnections("lemutar", setdone);
    utils.wait(loaded);
    assert.equals(true, myresponse.success);
}
