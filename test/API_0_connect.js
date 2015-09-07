utils.include(utils.baseURL + "../src/modules/API.js");

let response, loaded, server, api;
let cb = (res) => {
    response = res;
    loaded.value = true;
};

function setUp() {
    response = {};
    loaded = {
        value: false
    };

    server.expect("/download/download_redirector.cgi", 200, "/connect.txt");

    api = new Protocol(0, "http://localhost:4445");
}

function tearDown() {}

function startUp() {
    server = utils.setUpHttpServer(4445, "fixtures");
}

function shutDown() {
    utils.tearDownHttpServer(4445);
}


function doConnect(successful, str, responseKey) {
    api.connect(cb);
    utils.wait(loaded);
    assert.equals(successful, response.success);
    assert.equals(str, response[responseKey]);
}


test_API_0_connect_succeed_mock.description = "test_API_0_connect_succeed_mock";

function test_API_0_connect_succeed_mock() {
    utils.writeTo('{"id":"CONNECTION_ID","login_success":true,"success":true}', "fixtures/connect.txt");
    doConnect(true, "CONNECTION_ID", "id");
}

test_API_0_connect_fail_minus2_mock.description = "test_API_0_connect_fail_minus2_mock";

function test_API_0_connect_fail_minus2_mock() {
    utils.writeTo('{"errcode":-2,"login_success":false,"success":false}', "fixtures/connect.txt");
    doConnect(false, "Incorrect password", "error_text");
}

test_API_0_connect_fail_minus5_mock.description = "test_API_0_connect_fail_minus5_mock";

function test_API_0_connect_fail_minus5_mock() {
    utils.writeTo('{"errcode":-5,"login_success":false,"success":false}', "fixtures/connect.txt");
    doConnect(false, "No such account", "error_text");
}
